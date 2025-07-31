import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All expense routes require authentication
router.use(authenticate);

// Get all expenses for a project
router.get('/project/:projectId', (req, res) => {
  res.json({ message: 'Get expenses for project' });
});

// Create new expense
router.post('/', (req, res) => {
  res.json({ message: 'Create expense' });
});

// Update expense
router.put('/:id', (req, res) => {
  res.json({ message: 'Update expense' });
});

// Delete expense
router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete expense' });
});

export default router;