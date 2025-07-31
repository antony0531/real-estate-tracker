import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import * as expenseController from '../controllers/expense.controller';

const router = Router();

// All expense routes require authentication
router.use(authenticate);

// Get expense categories
router.get('/categories', expenseController.getCategories);

// Get all expenses for a project
router.get(
  '/project/:projectId',
  [param('projectId').isUUID().withMessage('Invalid project ID')],
  validateRequest,
  expenseController.getProjectExpenses
);

// Get expense statistics for a project
router.get(
  '/project/:projectId/stats',
  [param('projectId').isUUID().withMessage('Invalid project ID')],
  validateRequest,
  expenseController.getProjectExpenseStats
);

// Get single expense
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid expense ID')],
  validateRequest,
  expenseController.getExpense
);

// Create new expense
router.post(
  '/',
  [
    body('project_id').isUUID().withMessage('Valid project ID is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('vendor').trim().notEmpty().withMessage('Vendor is required'),
    body('description').optional().trim(),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('category_id').optional().isUUID().withMessage('Invalid category ID'),
    body('payment_method').optional().isIn(['cash', 'credit_card', 'debit_card', 'check', 'bank_transfer', 'other']).withMessage('Invalid payment method'),
    body('status').optional().isIn(['pending', 'approved', 'paid', 'rejected']).withMessage('Invalid status')
  ],
  validateRequest,
  expenseController.createExpense
);

// Update expense
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid expense ID'),
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('vendor').optional().trim().notEmpty().withMessage('Vendor cannot be empty'),
    body('description').optional().trim(),
    body('date').optional().isISO8601().withMessage('Invalid date'),
    body('category_id').optional().isUUID().withMessage('Invalid category ID'),
    body('payment_method').optional().isIn(['cash', 'credit_card', 'debit_card', 'check', 'bank_transfer', 'other']).withMessage('Invalid payment method'),
    body('status').optional().isIn(['pending', 'approved', 'paid', 'rejected']).withMessage('Invalid status')
  ],
  validateRequest,
  expenseController.updateExpense
);

// Delete expense
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid expense ID')],
  validateRequest,
  expenseController.deleteExpense
);

export default router;