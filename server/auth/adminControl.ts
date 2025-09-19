/**
 * SECURE ADMIN ACCESS CONTROL SYSTEM
 * 
 * This system ensures ONLY the master admin account can grant/revoke admin privileges.
 * All unauthorized admin access attempts are logged and denied.
 */

import { Request, Response, NextFunction } from 'express';

// MASTER ADMIN - ONLY THIS ACCOUNT CAN GRANT ADMIN PRIVILEGES
// SECURITY: Read from environment variable - NO FALLBACK ALLOWED
const MASTER_ADMIN_EMAIL = process.env.MASTER_ADMIN_EMAIL;

// SECURITY: Validate master admin email is set (no hardcoded fallbacks)
if (!MASTER_ADMIN_EMAIL) {
  throw new Error('SECURITY ERROR: MASTER_ADMIN_EMAIL environment variable must be set - no hardcoded fallbacks allowed');
}

// Security audit log for tracking admin access attempts
interface AdminSecurityEvent {
  timestamp: Date;
  email: string;
  action: string;
  allowed: boolean;
  ip: string;
  userAgent: string;
}

const securityAuditLog: AdminSecurityEvent[] = [];

/**
 * Checks if an email is the master admin
 */
export function isMasterAdmin(email: string): boolean {
  return email === MASTER_ADMIN_EMAIL;
}

/**
 * Checks if a user should have admin privileges
 * ONLY master admin gets automatic admin access
 * All others DENIED unless explicitly granted by master admin
 */
export function isAuthorizedAdmin(email: string, isAdminFlag: boolean = false): boolean {
  // Only master admin gets automatic admin access
  if (isMasterAdmin(email)) {
    return true;
  }
  
  // All other users: admin access ONLY if explicitly granted by master admin
  // and stored in database with isAdmin: true
  return isAdminFlag === true;
}

/**
 * Logs security events for admin access attempts
 */
function logSecurityEvent(email: string, action: string, allowed: boolean, req?: Request) {
  const event: AdminSecurityEvent = {
    timestamp: new Date(),
    email,
    action,
    allowed,
    ip: req?.ip || 'unknown',
    userAgent: req?.get('User-Agent') || 'unknown'
  };
  
  securityAuditLog.push(event);
  
  // Keep only last 1000 events
  if (securityAuditLog.length > 1000) {
    securityAuditLog.shift();
  }
  
  // Log to console for immediate monitoring
  console.log(`[ADMIN SECURITY] ${allowed ? 'ALLOWED' : 'DENIED'} - ${email} attempted ${action} from ${event.ip}`);
}

/**
 * Secure admin middleware - STRICT ACCESS CONTROL
 */
export function requireSecureAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.session?.user;
  
  // Must be authenticated
  if (!user) {
    logSecurityEvent('anonymous', 'admin access without authentication', false, req);
    return res.status(401).json({ 
      message: "Authentication required",
      redirect: "/login"
    });
  }
  
  // Check against secure admin control
  const hasAdminAccess = isAuthorizedAdmin(user.email, user.isAdmin);
  
  if (!hasAdminAccess) {
    logSecurityEvent(user.email, 'unauthorized admin access attempt', false, req);
    return res.status(403).json({ 
      message: "Access denied. Admin privileges required.",
      redirect: "/"
    });
  }
  
  // Access granted - log for security monitoring
  logSecurityEvent(user.email, `admin access to ${req.path}`, true, req);
  next();
}

/**
 * Check if current user can grant admin privileges
 * ONLY master admin can grant admin access to others
 */
export function canGrantAdmin(userEmail: string): boolean {
  const canGrant = isMasterAdmin(userEmail);
  
  if (!canGrant) {
    logSecurityEvent(userEmail, 'unauthorized admin grant attempt', false);
  }
  
  return canGrant;
}

/**
 * Get security audit log (master admin only)
 */
export function getSecurityAuditLog(requesterEmail: string): AdminSecurityEvent[] {
  if (!isMasterAdmin(requesterEmail)) {
    logSecurityEvent(requesterEmail, 'unauthorized security log access', false);
    return [];
  }
  
  return [...securityAuditLog].reverse(); // Most recent first
}

/**
 * Deny any automatic admin assignment
 * Users can ONLY get admin access through explicit grant by master admin
 */
export function shouldAutoAssignAdmin(email: string): boolean {
  // ONLY master admin gets automatic admin access
  return isMasterAdmin(email);
}

export { MASTER_ADMIN_EMAIL };