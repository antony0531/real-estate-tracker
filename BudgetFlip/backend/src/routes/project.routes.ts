import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import * as projectController from '../controllers/project.controller';

const router = Router();

// All project routes require authentication
router.use(authenticate);

// Get all projects for user
router.get('/', projectController.getProjects);

// Create new project
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('budget').isNumeric().withMessage('Budget must be a number'),
    body('start_date').optional().isISO8601().withMessage('Invalid start date'),
    body('target_end_date').optional().isISO8601().withMessage('Invalid end date'),
    body('status').optional().isIn(['planning', 'in_progress', 'review', 'completed']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
  ],
  validateRequest,
  projectController.createProject
);

// Get project by ID
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid project ID')],
  validateRequest,
  projectController.getProject
);

// Update project
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid project ID'),
    body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty'),
    body('budget').optional().isNumeric().withMessage('Budget must be a number'),
    body('start_date').optional().isISO8601().withMessage('Invalid start date'),
    body('target_end_date').optional().isISO8601().withMessage('Invalid end date'),
    body('status').optional().isIn(['planning', 'in_progress', 'review', 'completed']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
  ],
  validateRequest,
  projectController.updateProject
);

// Delete project
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid project ID')],
  validateRequest,
  projectController.deleteProject
);

// Project member routes
router.post(
  '/:id/members',
  [
    param('id').isUUID().withMessage('Invalid project ID'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('role').optional().isIn(['member', 'admin']).withMessage('Invalid role')
  ],
  validateRequest,
  projectController.addProjectMember
);

router.delete(
  '/:id/members/:memberId',
  [
    param('id').isUUID().withMessage('Invalid project ID'),
    param('memberId').isUUID().withMessage('Invalid member ID')
  ],
  validateRequest,
  projectController.removeProjectMember
);

export default router;