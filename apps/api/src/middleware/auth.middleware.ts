import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/api-error';
import { User } from '../models/User';
import { UserRole } from '@e2o/types';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    organizationId: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    (req as AuthRequest).user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      (req as AuthRequest).user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        organizationId: decoded.organizationId,
      };
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
}
