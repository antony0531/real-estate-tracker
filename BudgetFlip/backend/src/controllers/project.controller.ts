import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Get all projects for a user
export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const result = await query(
    `SELECT 
      p.*,
      p.display_id,
      COALESCE(SUM(e.amount), 0) as total_spent,
      COUNT(DISTINCT e.id) as expense_count,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', pm.user_id,
            'name', u.name,
            'email', u.email
          )
        ) FILTER (WHERE pm.user_id IS NOT NULL), 
        '[]'
      ) as members
    FROM projects p
    LEFT JOIN expenses e ON p.id = e.project_id
    LEFT JOIN project_members pm ON p.id = pm.project_id
    LEFT JOIN users u ON pm.user_id = u.id
    WHERE p.created_by = $1 OR pm.user_id = $1
    GROUP BY p.id, p.display_id
    ORDER BY p.created_at DESC`,
    [userId]
  );

  res.json({
    success: true,
    data: result.rows
  });
});

// Get single project
export const getProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  const result = await query(
    `SELECT 
      p.*,
      p.display_id,
      COALESCE(SUM(e.amount), 0) as total_spent,
      COUNT(DISTINCT e.id) as expense_count,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', pm.user_id,
            'name', u.name,
            'email', u.email,
            'role', pm.role
          )
        ) FILTER (WHERE pm.user_id IS NOT NULL), 
        '[]'
      ) as members
    FROM projects p
    LEFT JOIN expenses e ON p.id = e.project_id
    LEFT JOIN project_members pm ON p.id = pm.project_id
    LEFT JOIN users u ON pm.user_id = u.id
    WHERE p.id = $1 AND (p.created_by = $2 OR pm.user_id = $2)
    GROUP BY p.id, p.display_id`,
    [id, userId]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Project not found', 404));
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
});

// Create new project
export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { 
    name, 
    address, 
    budget, 
    start_date, 
    target_end_date, 
    status = 'planning',
    priority = 'medium',
    description 
  } = req.body;

  // Get the next project number
  const projectNumberResult = await query(`SELECT nextval('project_number_seq') as project_number`);
  const projectNumber = projectNumberResult.rows[0].project_number;
  
  // Generate display_id
  const currentYear = new Date().getFullYear();
  const displayId = `BF-${currentYear}-${String(projectNumber).padStart(4, '0')}`;
  
  const result = await query(
    `INSERT INTO projects (
      name, address, budget, start_date, target_end_date, 
      status, priority, description, created_by, project_number, display_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
    RETURNING *`,
    [name, address, budget, start_date, target_end_date, status, priority, description, userId, projectNumber, displayId]
  );

  const project = result.rows[0];

  // Add owner as project member
  await query(
    'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
    [project.id, userId, 'owner']
  );

  logger.info(`New project created: ${name} by user ${userId}`);

  res.status(201).json({
    success: true,
    data: project
  });
});

// Update project
export const updateProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const updates = req.body;

  // Check if user has permission to update
  const permissionCheck = await query(
    `SELECT 1 FROM projects p 
     LEFT JOIN project_members pm ON p.id = pm.project_id
     WHERE p.id = $1 AND (p.created_by = $2 OR (pm.user_id = $2 AND pm.role IN ('owner', 'admin')))`,
    [id, userId]
  );

  if (permissionCheck.rows.length === 0) {
    return next(new AppError('You do not have permission to update this project', 403));
  }

  // Build dynamic update query
  const updateFields = [];
  const values = [];
  let paramCount = 1;

  const allowedFields = ['name', 'address', 'budget', 'start_date', 'target_end_date', 'status', 'priority', 'description'];
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = $${paramCount}`);
      values.push(updates[field]);
      paramCount++;
    }
  }

  if (updateFields.length === 0) {
    return next(new AppError('No valid fields to update', 400));
  }

  values.push(id);
  
  const result = await query(
    `UPDATE projects 
     SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $${paramCount} 
     RETURNING *, display_id`,
    values
  );

  res.json({
    success: true,
    data: result.rows[0]
  });
});

// Delete project
export const deleteProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = (req as any).user.id;

  // Check if user is the owner
  const ownerCheck = await query(
    'SELECT 1 FROM projects WHERE id = $1 AND created_by = $2',
    [id, userId]
  );

  if (ownerCheck.rows.length === 0) {
    return next(new AppError('You do not have permission to delete this project', 403));
  }

  // Delete project (cascade will handle related records)
  await query('DELETE FROM projects WHERE id = $1', [id]);

  logger.info(`Project ${id} deleted by user ${userId}`);

  res.json({
    success: true,
    message: 'Project deleted successfully'
  });
});

// Add project member
export const addProjectMember = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { email, role = 'member' } = req.body;
  const userId = (req as any).user.id;

  // Check if user has permission
  const permissionCheck = await query(
    `SELECT 1 FROM projects p 
     LEFT JOIN project_members pm ON p.id = pm.project_id
     WHERE p.id = $1 AND (p.created_by = $2 OR (pm.user_id = $2 AND pm.role IN ('owner', 'admin')))`,
    [id, userId]
  );

  if (permissionCheck.rows.length === 0) {
    return next(new AppError('You do not have permission to add members to this project', 403));
  }

  // Find user by email
  const userResult = await query('SELECT id, name, email FROM users WHERE email = $1', [email]);
  
  if (userResult.rows.length === 0) {
    return next(new AppError('User not found', 404));
  }

  const newMember = userResult.rows[0];

  // Check if already a member
  const memberCheck = await query(
    'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
    [id, newMember.id]
  );

  if (memberCheck.rows.length > 0) {
    return next(new AppError('User is already a member of this project', 400));
  }

  // Add member
  await query(
    'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
    [id, newMember.id, role]
  );

  res.status(201).json({
    success: true,
    data: {
      id: newMember.id,
      name: newMember.name,
      email: newMember.email,
      role
    }
  });
});

// Remove project member
export const removeProjectMember = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id, memberId } = req.params;
  const userId = (req as any).user.id;

  // Check if user has permission
  const permissionCheck = await query(
    `SELECT 1 FROM projects p 
     LEFT JOIN project_members pm ON p.id = pm.project_id
     WHERE p.id = $1 AND (p.created_by = $2 OR (pm.user_id = $2 AND pm.role IN ('owner', 'admin')))`,
    [id, userId]
  );

  if (permissionCheck.rows.length === 0) {
    return next(new AppError('You do not have permission to remove members from this project', 403));
  }

  // Can't remove the owner
  const ownerCheck = await query(
    'SELECT 1 FROM projects WHERE id = $1 AND created_by = $2',
    [id, memberId]
  );

  if (ownerCheck.rows.length > 0) {
    return next(new AppError('Cannot remove the project owner', 400));
  }

  // Remove member
  const result = await query(
    'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
    [id, memberId]
  );

  if (result.rowCount === 0) {
    return next(new AppError('Member not found in this project', 404));
  }

  res.json({
    success: true,
    message: 'Member removed successfully'
  });
});