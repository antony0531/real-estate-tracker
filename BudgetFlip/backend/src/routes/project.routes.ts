import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All project routes require authentication
router.use(authenticate);

// Get all projects for user
router.get('/', (req, res) => {
  res.json({ message: 'Get all projects' });
});

// Create new project
router.post('/', (req, res) => {
  res.json({ message: 'Create project' });
});

// Get project by ID
router.get('/:id', (req, res) => {
  res.json({ message: 'Get project by ID' });
});

// Update project
router.put('/:id', (req, res) => {
  res.json({ message: 'Update project' });
});

// Delete project
router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete project' });
});

export default router;