import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

// Generate JWT token
const generateToken = (user: any): string => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const secret = process.env.JWT_SECRET || 'secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
  
  return jwt.sign(payload, secret, { expiresIn } as any);
};

// Generate refresh token
const generateRefreshToken = (user: any): string => {
  const payload = { id: user.id };
  const secret = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  
  return jwt.sign(payload, secret, { expiresIn } as any);
};

// Register new user
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  // Check if user exists
  const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  
  if (existingUser.rows.length > 0) {
    return next(new AppError('User already exists', 400));
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const result = await query(
    'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name, role',
    [email, name, passwordHash]
  );

  const user = result.rows[0];

  // Generate tokens
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  logger.info(`New user registered: ${email}`);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token,
      refreshToken
    }
  });
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Get user with password
  const result = await query(
    'SELECT id, email, name, role, password_hash FROM users WHERE email = $1 AND is_active = true',
    [email]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Invalid credentials', 401));
  }

  const user = result.rows[0];

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  
  if (!isPasswordValid) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Generate tokens
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  logger.info(`User logged in: ${email}`);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token,
      refreshToken
    }
  });
});

// Refresh token
export const refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body;

  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh-secret'
    ) as any;

    // Get user
    const result = await query(
      'SELECT id, email, name, role FROM users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    const user = result.rows[0];

    // Generate new tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return next(new AppError('Invalid refresh token', 401));
  }
});

// Logout
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // In a production app, you might want to blacklist the token in Redis
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});