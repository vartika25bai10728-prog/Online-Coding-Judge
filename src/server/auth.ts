import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { User, Role } from '../types';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'apex-judge-secret-key-348920148-secure-prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'apex-judge-refresh-key-928172648';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateTokens(user: User) {
  const accessToken = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.query.token as string);

  if (!token) {
    return res.status(401).json({
      timestamp: new Date().toISOString(),
      status: 401,
      error: 'UNAUTHORIZED',
      message: 'Authentication token is required',
      path: req.originalUrl
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      timestamp: new Date().toISOString(),
      status: 401,
      error: 'INVALID_TOKEN',
      message: 'Token is invalid or has expired',
      path: req.originalUrl
    });
  }

  const user = db.getUserById(payload.id);
  if (!user) {
    return res.status(401).json({
      timestamp: new Date().toISOString(),
      status: 401,
      error: 'USER_NOT_FOUND',
      message: 'User associated with token no longer exists',
      path: req.originalUrl
    });
  }

  req.user = user;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        timestamp: new Date().toISOString(),
        status: 403,
        error: 'FORBIDDEN',
        message: 'Admin privileges are required for this action',
        path: req.originalUrl
      });
    }
    next();
  });
}
