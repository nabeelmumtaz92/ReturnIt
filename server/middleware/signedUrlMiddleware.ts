import type { Request, Response, NextFunction } from 'express';
import { verifySignedToken } from '@shared/utils/urlSigner';

/**
 * Middleware to verify signed URL tokens
 * Protects endpoints that should only be accessible via signed URLs
 */

export function requireSignedUrl(req: Request, res: Response, next: NextFunction) {
  const token = req.query.token as string;
  
  if (!token) {
    return res.status(403).json({
      error: true,
      message: 'Access denied. This link requires a valid token.',
      code: 'MISSING_TOKEN'
    });
  }
  
  // Verify and decode the signed token
  const tokenData = verifySignedToken(token);
  
  if (!tokenData) {
    return res.status(403).json({
      error: true,
      message: 'Invalid or expired link. Please request a new link.',
      code: 'INVALID_TOKEN'
    });
  }
  
  // Attach token data to request for downstream use
  (req as any).signedUrlData = tokenData;
  
  next();
}

/**
 * Middleware to verify signed URL and check resource access
 * Ensures the token's resourceId matches the requested resource
 */
export function requireSignedUrlForResource(resourceParam: string = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.query.token as string;
    
    if (!token) {
      return res.status(403).json({
        error: true,
        message: 'Access denied. This link requires a valid token.',
        code: 'MISSING_TOKEN'
      });
    }
    
    // Verify and decode the signed token
    const tokenData = verifySignedToken(token);
    
    if (!tokenData) {
      return res.status(403).json({
        error: true,
        message: 'Invalid or expired link. Please request a new link.',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Verify the resource ID matches
    const requestedResourceId = req.params[resourceParam];
    if (tokenData.resourceId !== requestedResourceId) {
      return res.status(403).json({
        error: true,
        message: 'This link is not valid for the requested resource.',
        code: 'RESOURCE_MISMATCH'
      });
    }
    
    // Attach token data to request
    (req as any).signedUrlData = tokenData;
    
    next();
  };
}

/**
 * Middleware to verify signed URL and check user ownership
 * Ensures the token's userId matches the authenticated user
 */
export function requireSignedUrlWithUserCheck(req: Request, res: Response, next: NextFunction) {
  const token = req.query.token as string;
  
  if (!token) {
    return res.status(403).json({
      error: true,
      message: 'Access denied. This link requires a valid token.',
      code: 'MISSING_TOKEN'
    });
  }
  
  // Verify and decode the signed token
  const tokenData = verifySignedToken(token);
  
  if (!tokenData) {
    return res.status(403).json({
      error: true,
      message: 'Invalid or expired link. Please request a new link.',
      code: 'INVALID_TOKEN'
    });
  }
  
  // Check if user is authenticated (optional - token works even if not logged in)
  const sessionUserId = (req.session as any)?.user?.id;
  
  // If token has userId, verify it matches session user (if logged in)
  if (tokenData.userId && sessionUserId && tokenData.userId !== sessionUserId) {
    return res.status(403).json({
      error: true,
      message: 'This link is not valid for your account.',
      code: 'USER_MISMATCH'
    });
  }
  
  // Attach token data to request
  (req as any).signedUrlData = tokenData;
  
  next();
}
