import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get all expenses for a project
export const getProjectExpenses = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { projectId } = req.params;
  const userId = (req as any).user.id;

  // Check if user has access to the project
  logger.info(`[getProjectExpenses] Checking access for project ${projectId}, user ${userId}`);
  const accessCheck = await query(
    `SELECT 1 FROM projects p 
     LEFT JOIN project_members pm ON p.id = pm.project_id
     WHERE p.id = $1 AND (p.created_by = $2 OR pm.user_id = $2)`,
    [projectId, userId]
  );

  if (accessCheck.rows.length === 0) {
    return next(new AppError('You do not have access to this project', 403));
  }

  // Get expenses with category information
  const result = await query(
    `SELECT 
      e.id, e.project_id, e.amount, e.vendor, e.description,
      e.expense_date as date, e.category_id,
      e.status, e.created_by, e.created_at, e.updated_at,
      ec.name as category_name,
      ec.color as category_color,
      u.name as created_by_name,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', d.id,
            'filename', d.file_name,
            'file_path', d.file_url,
            'file_size', d.file_size,
            'mime_type', d.mime_type,
            'uploaded_at', d.uploaded_at
          )
        ) FILTER (WHERE d.id IS NOT NULL), 
        '[]'
      ) as documents
    FROM expenses e
    LEFT JOIN expense_categories ec ON e.category_id = ec.id
    LEFT JOIN users u ON e.created_by = u.id
    LEFT JOIN documents d ON d.expense_id = e.id
    WHERE e.project_id = $1
    GROUP BY e.id, ec.name, ec.color, u.name
    ORDER BY e.expense_date DESC, e.created_at DESC`,
    [projectId]
  );

  res.json({
    success: true,
    data: result.rows
  });
});

// Get single expense
export const getExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  const result = await query(
    `SELECT 
      e.id, e.project_id, e.amount, e.vendor, e.description,
      e.expense_date as date, e.category_id,
      e.status, e.created_by, e.created_at, e.updated_at,
      ec.name as category_name,
      ec.color as category_color,
      u.name as created_by_name,
      p.name as project_name,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', d.id,
            'filename', d.file_name,
            'file_path', d.file_url,
            'file_size', d.file_size,
            'mime_type', d.mime_type,
            'uploaded_at', d.uploaded_at
          )
        ) FILTER (WHERE d.id IS NOT NULL), 
        '[]'
      ) as documents
    FROM expenses e
    LEFT JOIN expense_categories ec ON e.category_id = ec.id
    LEFT JOIN users u ON e.created_by = u.id
    LEFT JOIN projects p ON e.project_id = p.id
    LEFT JOIN project_members pm ON p.id = pm.project_id
    LEFT JOIN documents d ON d.expense_id = e.id
    WHERE e.id = $1 AND (p.created_by = $2 OR pm.user_id = $2)
    GROUP BY e.id, ec.name, ec.color, u.name, p.name`,
    [id, userId]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Expense not found', 404));
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
});

// Create new expense
export const createExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user.id;
  const {
    project_id,
    amount,
    vendor,
    description,
    date,
    expense_date,
    category_id,
    status = 'pending'
  } = req.body;

  // Check if user has access to the project
  const accessCheck = await query(
    `SELECT 1 FROM projects p 
     LEFT JOIN project_members pm ON p.id = pm.project_id
     WHERE p.id = $1 AND (p.created_by = $2 OR pm.user_id = $2)`,
    [project_id, userId]
  );

  if (accessCheck.rows.length === 0) {
    return next(new AppError('You do not have access to this project', 403));
  }

  // Create expense
  const result = await query(
    `INSERT INTO expenses (
      project_id, amount, vendor, description, expense_date, 
      category_id, status, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
    RETURNING *, expense_date as date`,
    [project_id, amount, vendor, description, expense_date || date, category_id, status, userId]
  );

  const expense = result.rows[0];

  // Log activity
  await query(
    `INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id, details)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [project_id, userId, 'created', 'expense', expense.id, JSON.stringify({ amount, vendor })]
  );

  logger.info(`New expense created: ${vendor} - $${amount} for project ${project_id}`);

  res.status(201).json({
    success: true,
    data: expense
  });
});

// Update expense
export const updateExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const updates = req.body;

  // Check if user has access
  const accessCheck = await query(
    `SELECT e.*, p.created_by, pm.role 
     FROM expenses e
     JOIN projects p ON e.project_id = p.id
     LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $2
     WHERE e.id = $1 AND (p.created_by = $2 OR pm.user_id = $2)`,
    [id, userId]
  );

  if (accessCheck.rows.length === 0) {
    return next(new AppError('Expense not found or access denied', 404));
  }

  // Build dynamic update query
  const updateFields = [];
  const values = [];
  let paramCount = 1;

  const allowedFields = ['amount', 'vendor', 'description', 'expense_date', 'category_id', 'status'];
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = $${paramCount}`);
      values.push(updates[field]);
      paramCount++;
    }
  }
  
  // Handle 'date' field mapping to 'expense_date'
  if (updates['date'] !== undefined && !updates['expense_date']) {
    updateFields.push(`expense_date = $${paramCount}`);
    values.push(updates['date']);
    paramCount++;
  }

  if (updateFields.length === 0) {
    return next(new AppError('No valid fields to update', 400));
  }

  values.push(id);
  
  const result = await query(
    `UPDATE expenses 
     SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $${paramCount} 
     RETURNING *, expense_date as date`,
    values
  );

  // Log activity
  const expense = result.rows[0];
  await query(
    `INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id, details)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [expense.project_id, userId, 'updated', 'expense', expense.id, JSON.stringify(updates)]
  );

  res.json({
    success: true,
    data: expense
  });
});

// Delete expense
export const deleteExpense = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  // Check if user has permission to delete
  const permissionCheck = await query(
    `SELECT e.*, p.created_by, pm.role 
     FROM expenses e
     JOIN projects p ON e.project_id = p.id
     LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $2
     WHERE e.id = $1 AND (
       p.created_by = $2 OR 
       (pm.user_id = $2 AND pm.role IN ('owner', 'admin')) OR
       e.created_by = $2
     )`,
    [id, userId]
  );

  if (permissionCheck.rows.length === 0) {
    return next(new AppError('Expense not found or access denied', 404));
  }

  const expense = permissionCheck.rows[0];

  // Delete expense (documents will be cascade deleted)
  await query('DELETE FROM expenses WHERE id = $1', [id]);

  // Log activity
  await query(
    `INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id, details)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [expense.project_id, userId, 'deleted', 'expense', id, JSON.stringify({ vendor: expense.vendor, amount: expense.amount })]
  );

  logger.info(`Expense ${id} deleted by user ${userId}`);

  res.json({
    success: true,
    message: 'Expense deleted successfully'
  });
});

// Get expense categories
export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const result = await query(
    'SELECT * FROM expense_categories ORDER BY name',
    []
  );

  res.json({
    success: true,
    data: result.rows
  });
});

// Get expense statistics for a project
export const getProjectExpenseStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { projectId } = req.params;
  const userId = (req as any).user.id;

  // Check if user has access to the project
  const accessCheck = await query(
    `SELECT 1 FROM projects p 
     LEFT JOIN project_members pm ON p.id = pm.project_id
     WHERE p.id = $1 AND (p.created_by = $2 OR pm.user_id = $2)`,
    [projectId, userId]
  );

  if (accessCheck.rows.length === 0) {
    return next(new AppError('You do not have access to this project', 403));
  }

  // Get statistics
  const stats = await query(
    `SELECT 
      COUNT(*) as total_expenses,
      COALESCE(SUM(amount), 0) as total_amount,
      COALESCE(AVG(amount), 0) as average_expense,
      COALESCE(MAX(amount), 0) as highest_expense,
      COUNT(DISTINCT category_id) as categories_used,
      COUNT(DISTINCT vendor) as unique_vendors,
      json_build_object(
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'approved', COUNT(*) FILTER (WHERE status = 'approved'),
        'paid', COUNT(*) FILTER (WHERE status = 'paid'),
        'rejected', COUNT(*) FILTER (WHERE status = 'rejected')
      ) as status_breakdown,
      COALESCE(
        json_agg(
          json_build_object(
            'category_id', category_stats.category_id,
            'category_name', category_stats.category_name,
            'total', category_stats.total,
            'count', category_stats.count
          )
        ) FILTER (WHERE category_stats.category_id IS NOT NULL),
        '[]'
      ) as category_breakdown
    FROM expenses e
    LEFT JOIN (
      SELECT 
        e2.category_id,
        ec.name as category_name,
        SUM(e2.amount) as total,
        COUNT(*) as count
      FROM expenses e2
      JOIN expense_categories ec ON e2.category_id = ec.id
      WHERE e2.project_id = $1
      GROUP BY e2.category_id, ec.name
      ORDER BY SUM(e2.amount) DESC
      LIMIT 10
    ) category_stats ON true
    WHERE e.project_id = $1
    GROUP BY category_stats.category_id, category_stats.category_name, category_stats.total, category_stats.count`,
    [projectId]
  );

  res.json({
    success: true,
    data: stats.rows[0]
  });
});