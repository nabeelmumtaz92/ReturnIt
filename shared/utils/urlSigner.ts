import { createHmac, randomBytes } from 'crypto';

/**
 * URL Signing Utility
 * Generates cryptographically signed URLs with expiration for secure access to sensitive resources
 */

// Secret key for HMAC signing - MUST be set via URL_SIGNING_SECRET environment variable
// No fallback value - server will refuse to start without this critical security setting
if (!process.env.URL_SIGNING_SECRET || process.env.URL_SIGNING_SECRET.length < 32) {
  throw new Error(
    'CRITICAL SECURITY ERROR: URL_SIGNING_SECRET environment variable is missing or too short. ' +
    'This secret is required for generating secure signed URLs for order receipts and invoices. ' +
    'Please set a strong secret (minimum 32 characters) in your environment variables.'
  );
}

// Type-safe constant after validation
const SIGNING_SECRET: string = process.env.URL_SIGNING_SECRET;

export interface SignedUrlParams {
  resource: string; // e.g., 'order', 'tracking', 'invoice', 'receipt'
  resourceId: string; // e.g., order ID, tracking number
  userId?: number; // Optional: tie URL to specific user
  expiresInHours?: number; // Default: 72 hours
  metadata?: Record<string, any>; // Optional additional data
}

export interface SignedUrlData {
  resource: string;
  resourceId: string;
  userId?: number;
  expiresAt: number; // Unix timestamp
  metadata?: Record<string, any>;
}

/**
 * Generate a signed token for a URL
 */
export function generateSignedToken(params: SignedUrlParams): string {
  const expiresInHours = params.expiresInHours || 72; // Default 72 hours
  const expiresAt = Date.now() + (expiresInHours * 60 * 60 * 1000);
  
  const data: SignedUrlData = {
    resource: params.resource,
    resourceId: params.resourceId,
    userId: params.userId,
    expiresAt,
    metadata: params.metadata
  };
  
  // Create payload (base64-encoded JSON)
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  
  // Generate HMAC signature
  const signature = createHmac('sha256', SIGNING_SECRET)
    .update(payload)
    .digest('base64url');
  
  // Return token as payload.signature
  return `${payload}.${signature}`;
}

/**
 * Verify and decode a signed token
 */
export function verifySignedToken(token: string): SignedUrlData | null {
  try {
    const [payload, signature] = token.split('.');
    
    if (!payload || !signature) {
      console.warn('Invalid token format - missing payload or signature');
      return null;
    }
    
    // Verify signature
    const expectedSignature = createHmac('sha256', SIGNING_SECRET)
      .update(payload)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      console.warn('Invalid token signature');
      return null;
    }
    
    // Decode payload
    const data: SignedUrlData = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8')
    );
    
    // Check expiration
    if (data.expiresAt && Date.now() > data.expiresAt) {
      console.warn('Token expired');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error verifying signed token:', error);
    return null;
  }
}

/**
 * Generate a complete signed URL
 */
export function generateSignedUrl(baseUrl: string, params: SignedUrlParams): string {
  const token = generateSignedToken(params);
  const url = new URL(baseUrl);
  url.searchParams.set('token', token);
  return url.toString();
}

/**
 * Generate a secure access token for a resource (stored in database)
 */
export function generateAccessToken(): string {
  // Generate 32-byte random token
  const token = randomBytes(32).toString('base64url');
  return `at_${token}`;
}

/**
 * Validate access token format
 */
export function validateAccessTokenFormat(token: string): boolean {
  return /^at_[A-Za-z0-9_-]{43}$/.test(token);
}
