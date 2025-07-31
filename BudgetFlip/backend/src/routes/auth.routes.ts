import { Router } from 'express';
import { body } from 'express-validator';
import { authLimiter } from '../middleware/rateLimit.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Register new user
router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required')
  ],
  validateRequest,
  authController.register
);

// Login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validateRequest,
  authController.login
);

// Refresh token
router.post(
  '/refresh',
  authLimiter,
  [body('refreshToken').notEmpty()],
  validateRequest,
  authController.refreshToken
);

// Logout
router.post('/logout', authController.logout);

export default router;