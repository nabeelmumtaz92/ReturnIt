import express from 'express';
import { AdminPasswordService } from '../services/adminPasswordService';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const router = express.Router();

// Rate limiter: 5 attempts per minute per IP
const loginRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

// Rate limiter middleware
const rateLimitMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    await loginRateLimiter.consume(req.ip || 'unknown');
    next();
  } catch {
    res.status(429).json({ error: 'Too many attempts. Try again later.' });
  }
};

/**
 * POST /api/admin/password/verify
 * Verify admin password and get authentication status
 */
router.post('/verify', rateLimitMiddleware, async (req, res) => {
  try {
    const { adminUserId, password } = req.body;
    
    if (!adminUserId || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await AdminPasswordService.verifyAdminPassword(adminUserId, password);
    
    if (!result.success) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Store admin password verification in session
    if (req.session) {
      req.session.adminPasswordVerified = true;
      req.session.adminTokenVersion = result.tokenVersion;
    }
    
    res.json({
      success: true,
      tokenVersion: result.tokenVersion,
      message: 'Password verified successfully',
    });
  } catch (error) {
    console.error('Admin password verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/password/change
 * Change admin password (requires current password)
 */
router.post('/change', rateLimitMiddleware, async (req, res) => {
  try {
    const { adminUserId, currentPassword, newPassword } = req.body;
    
    if (!adminUserId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate new password strength
    if (newPassword.length < 12) {
      return res.status(400).json({ error: 'New password must be at least 12 characters' });
    }
    
    const result = await AdminPasswordService.changeAdminPassword(
      adminUserId,
      currentPassword,
      newPassword
    );
    
    if (!result.success) {
      return res.status(401).json({ error: result.message });
    }
    
    // Clear admin password verification from session (force re-login)
    if (req.session) {
      req.session.adminPasswordVerified = false;
      delete req.session.adminTokenVersion;
    }
    
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Admin password change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/password/reset-signed
 * Reset password using offline signed token (emergency recovery)
 */
router.post('/reset-signed', async (req, res) => {
  try {
    const { payload, signature, publicKey } = req.body;
    
    if (!payload || !signature || !publicKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await AdminPasswordService.resetPasswordWithSignedToken(
      payload,
      signature,
      publicKey
    );
    
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Extend session type
declare module 'express-session' {
  interface SessionData {
    adminPasswordVerified?: boolean;
    adminTokenVersion?: number;
  }
}

export default router;
