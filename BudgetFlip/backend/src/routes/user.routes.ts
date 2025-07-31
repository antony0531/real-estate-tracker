import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/profile', (req, res) => {
  res.json({ message: 'Get user profile' });
});

// Update user profile
router.put('/profile', (req, res) => {
  res.json({ message: 'Update user profile' });
});

// Change password
router.post('/change-password', (req, res) => {
  res.json({ message: 'Change password' });
});

export default router;