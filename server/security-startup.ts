/**
 * SECURITY STARTUP CHECKS
 * 
 * This module performs critical security validation at application startup
 * to ensure all required security environment variables are properly configured.
 */

/**
 * Validates all required security environment variables
 * Throws errors for missing critical security configurations
 */
export function validateSecurityConfig(): void {
  const errors: string[] = [];
  
  // Session secret is critical for session security
  if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    errors.push('SESSION_SECRET must be set in production');
  }
  
  // Master admin email must be configured - NO FALLBACKS
  if (!process.env.MASTER_ADMIN_EMAIL) {
    errors.push('MASTER_ADMIN_EMAIL must be set - no hardcoded fallbacks allowed');
  }
  
  // Stripe credentials for payment processing
  if (!process.env.STRIPE_SECRET_KEY) {
    errors.push('STRIPE_SECRET_KEY is required for payment processing');
  }
  
  // Database connection
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required for database connection');
  }
  
  // If this is staging environment, ensure staging credentials are set
  if (process.env.NODE_ENV === 'staging') {
    if (!process.env.STAGING_USERNAME || !process.env.STAGING_PASSWORD) {
      errors.push('STAGING_USERNAME and STAGING_PASSWORD must be set for staging environment');
    }
  }
  
  if (errors.length > 0) {
    console.error('🚨 SECURITY CONFIGURATION ERRORS:');
    errors.forEach(error => console.error(`  ❌ ${error}`));
    throw new Error(`Security configuration errors: ${errors.join(', ')}`);
  }
  
  console.log('✅ Security configuration validated successfully');
}

/**
 * Logs current security configuration status (without exposing secrets)
 */
export function logSecurityStatus(): void {
  console.log('🛡️  Security Configuration Status:');
  console.log(`  📧 Master Admin: ${process.env.MASTER_ADMIN_EMAIL || 'nabeelmumtaz92@gmail.com'}`);
  console.log(`  🔐 Session Secret: ${process.env.SESSION_SECRET ? 'SET' : 'NOT SET'}`);
  console.log(`  💳 Stripe Secret: ${process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET'}`);
  console.log(`  🗄️  Database URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
  console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}