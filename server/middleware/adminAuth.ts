import { Request, Response, NextFunction } from 'express';
import { requireSecureAdmin, isAuthorizedAdmin } from '../auth/adminControl';

// SECURE admin authentication middleware - uses new security system
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireSecureAdmin(req, res, next);
}

// Middleware to check if user is admin (without blocking) - uses new security system
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.session?.user;
  (req as any).isAdmin = user ? isAuthorizedAdmin(user.email, user.isAdmin) : false;
  next();
}