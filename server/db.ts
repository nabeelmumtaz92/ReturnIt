import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";
import { PerformanceService } from "./performance";

// Configure neon for HTTP client (stateless, serverless-friendly)
// Note: fetchConnectionCache is now always enabled by default

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Stateless HTTP-based database client (no persistent connections)
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Retry helper for transient connection errors
async function retryOnTransientError<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 100
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isTransientError = 
        error?.code === '57P01' || // admin_shutdown
        error?.code === '57P02' || // crash_shutdown  
        error?.code === '57P03' || // cannot_connect_now
        error?.code === 'ECONNRESET' ||
        error?.code === 'EPIPE' ||
        error?.code === 'ETIMEDOUT';

      if (isTransientError && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // exponential backoff
        console.log(`Database transient error (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Database health monitoring with retry logic
export async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    await retryOnTransientError(async () => {
      return await sql`SELECT 1`;
    });
    const duration = Date.now() - start;
    
    PerformanceService.trackMetric('db_health_check', duration);
    
    return {
      healthy: true,
      responseTime: duration,
      connectionType: 'HTTP (stateless)'
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export retry helper for use in other parts of the application
export { retryOnTransientError };

// No graceful shutdown needed for HTTP client (stateless connections)
