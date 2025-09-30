import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { validateSecurityConfig, logSecurityStatus } from "./security-startup";
import { setupVite, serveStatic, log } from "./vite";
import { PerformanceService, performanceMiddleware } from "./performance";
import { webSocketService } from "./websocket-service";
import { 
  globalErrorHandler, 
  setupUnhandledRejectionHandler, 
  setupUncaughtExceptionHandler,
  requestTimeoutHandler,
  getErrorHealthStatus
} from "./middleware/errorHandler";
import { crashRecovery } from "./middleware/crashRecovery";

const app = express();

// Trust proxy for HTTPS cookies behind Replit proxy
app.set('trust proxy', 1);

// Enable gzip compression for all responses
app.use(compression({
  threshold: 1024, // Only compress responses larger than 1KB
  level: 6, // Compression level (1-9)
  filter: (req: any, res: any) => {
    // Don't compress if it's a cache miss for service worker
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Add performance middleware
app.use(performanceMiddleware);

// Add caching headers for static assets
app.use((req, res, next) => {
  if (req.url === '/sw.js' || req.url === '/manifest.json' || req.url === '/site.webmanifest') {
    // Critical PWA files - no cache to ensure updates work on Android
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  } else if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year for static assets
  } else if (req.url.startsWith('/api/')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Setup global error handling before anything else
  setupUnhandledRejectionHandler();
  setupUncaughtExceptionHandler();

  // Add request timeout middleware
  app.use(requestTimeoutHandler(30000)); // 30 second timeout

  // SECURITY: Validate all security configurations at startup
  try {
    validateSecurityConfig();
    logSecurityStatus();
  } catch (error) {
    console.error('❌ SECURITY VALIDATION FAILED:', error);
    process.exit(1);
  }
  
  // Register routes with error handling
  let server;
  try {
    server = await registerRoutes(app);
  } catch (error) {
    console.error('❌ Failed to register routes:', error);
    process.exit(1);
  }

  // Initialize WebSocket service for real-time tracking
  try {
    webSocketService.initialize(server);
  } catch (error) {
    console.error('⚠️ WebSocket service initialization failed (non-critical):', error);
    // Continue without WebSocket - it's not critical for basic functionality
  }

  // Use comprehensive error handler
  app.use(globalErrorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  try {
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
  } catch (error) {
    console.error('❌ Failed to setup static/vite serving:', error);
    process.exit(1);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Add error handling for server startup
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use`);
    } else if (error.code === 'EACCES') {
      console.error(`❌ Permission denied to bind to port ${port}`);
    } else {
      console.error('❌ Server error:', error);
    }
    process.exit(1);
  });
  
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    log(`WebSocket tracking available at ws://localhost:${port}/ws/tracking`);
    
    // Log environment for debugging deployments
    if (process.env.NODE_ENV === 'production') {
      console.log('🚀 Production deployment ready');
      console.log('📊 Session store:', process.env.DATABASE_URL ? 'PostgreSQL' : 'MemoryStore (fallback)');
    }
  });

  // Graceful shutdown handling
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    webSocketService.cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    webSocketService.cleanup();
    process.exit(0);
  });
})();
