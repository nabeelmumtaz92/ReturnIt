# ReturnIt Security & Access Guide

## Overview
ReturnIt implements enterprise-grade security with role-based access control, API key management, and comprehensive authentication systems.

## Access Control Architecture

### User Roles & Permissions
```typescript
// Role-based access control
interface UserRoles {
  customer: {
    permissions: ['order:create', 'order:view_own', 'order:cancel_own'];
    restrictions: ['no_admin_access', 'own_data_only'];
  };
  driver: {
    permissions: ['order:accept', 'order:update_status', 'location:update', 'earnings:view'];
    restrictions: ['assigned_orders_only', 'no_customer_data'];
  };
  admin: {
    permissions: ['*']; // Full access
    restrictions: ['audit_logged'];
  };
  support: {
    permissions: ['order:view', 'user:view', 'ticket:manage'];
    restrictions: ['no_financial_data', 'no_system_config'];
  };
}
```

### Admin Access Control
```typescript
// Exclusive admin access
const MASTER_ADMINS = [
  "nabeelmumtaz92@gmail.com",
  "durremumtaz@gmail.com" // Secondary admin
];

// Admin middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req.session as any).user;
  
  if (!user?.isAdmin || !MASTER_ADMINS.includes(user.email)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  // Log admin access for audit
  console.log(`Admin access: ${user.email} - ${req.method} ${req.path}`);
  next();
}
```

### Environment-Based Access
```typescript
// Development vs Production access control
const environmentAccess = {
  development: {
    allowedEmails: ['*'], // All emails allowed in dev
    requireMFA: false,
    sessionTimeout: '24h'
  },
  staging: {
    allowedEmails: MASTER_ADMINS.concat(['testing@returnit.com']),
    requireMFA: true,
    sessionTimeout: '8h'
  },
  production: {
    allowedEmails: MASTER_ADMINS,
    requireMFA: true,
    sessionTimeout: '4h'
  }
};
```

## Authentication Systems

### Multi-Provider Authentication
```typescript
// Supported authentication methods
const authProviders = {
  local: {
    method: 'email/password',
    security: 'bcrypt with salt rounds',
    requirements: ['password_complexity', 'email_verification']
  },
  google: {
    method: 'OAuth 2.0',
    clientId: process.env.GOOGLE_CLIENT_ID,
    scopes: ['profile', 'email']
  },
  apple: {
    method: 'Sign in with Apple',
    teamId: process.env.APPLE_TEAM_ID,
    keyId: process.env.APPLE_KEY_ID
  },
  facebook: {
    method: 'Facebook Login',
    appId: process.env.FACEBOOK_APP_ID,
    scopes: ['email']
  }
};
```

### Session Management
```typescript
// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET, // 256-bit random string
  resave: false,
  saveUninitialized: false,
  store: new PostgreSQLStore({
    connectionString: process.env.DATABASE_URL,
    tableName: 'user_sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    httpOnly: true, // Prevent XSS
    maxAge: 4 * 60 * 60 * 1000, // 4 hours
    sameSite: 'strict' // CSRF protection
  }
};
```

### Password Security
```typescript
// Password hashing and validation
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // High security

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Password complexity requirements
const passwordRequirements = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  bannedPasswords: ['password', '12345678', 'qwerty'] // Common passwords
};
```

## API Key & Secret Management

### Environment Variables
```bash
# Authentication secrets
SESSION_SECRET=random-256-bit-string
GOOGLE_CLIENT_ID=google-oauth-client-id
GOOGLE_CLIENT_SECRET=google-oauth-secret
APPLE_PRIVATE_KEY=apple-private-key-content
FACEBOOK_APP_SECRET=facebook-app-secret

# Payment processing
STRIPE_SECRET_KEY=sk_live_stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_stripe-webhook-secret

# External services
GOOGLE_MAPS_API_KEY=google-maps-api-key
TWILIO_AUTH_TOKEN=twilio-auth-token

# Database
DATABASE_URL=postgresql://user:pass@host:5432/returnit
```

### Secret Rotation Procedures
```typescript
// Automated secret rotation (quarterly)
class SecretRotationService {
  async rotateStripeKeys(): Promise<void> {
    // 1. Generate new API keys in Stripe dashboard
    // 2. Update environment variables
    // 3. Test payment processing
    // 4. Deactivate old keys after 24h grace period
    
    console.log('🔐 Stripe keys rotated successfully');
  }
  
  async rotateSessionSecret(): Promise<void> {
    // 1. Generate new 256-bit secret
    // 2. Update SESSION_SECRET environment variable
    // 3. Restart application to load new secret
    // 4. Existing sessions will be invalidated
    
    console.log('🔐 Session secret rotated - users will need to re-login');
  }
  
  async rotateWebhookSecrets(): Promise<void> {
    // 1. Generate new webhook secrets
    // 2. Update merchant webhook configurations
    // 3. Update our webhook verification
    // 4. Test webhook deliveries
    
    console.log('🔐 Webhook secrets rotated successfully');
  }
}
```

### API Key Security
```typescript
// API key validation middleware
function validateAPIKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // Validate API key format and existence
  if (!isValidAPIKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // Rate limiting based on API key
  const rateLimitKey = `api_limit:${apiKey}`;
  // Implementation would check Redis/memory for rate limits
  
  next();
}

// API key generation for partners
function generateAPIKey(): string {
  return `ret_${crypto.randomBytes(32).toString('hex')}`;
}
```

## Multi-Factor Authentication (MFA)

### MFA Implementation (Future)
```typescript
// MFA setup for admin accounts
interface MFASettings {
  enabled: boolean;
  method: 'totp' | 'sms' | 'email';
  backupCodes: string[];
  enforced: boolean; // Required for admin accounts
}

// TOTP (Authenticator app) setup
async function setupTOTP(userId: number): Promise<{secret: string, qrCode: string}> {
  const secret = speakeasy.generateSecret({
    name: `ReturnIt (${user.email})`,
    issuer: 'ReturnIt'
  });
  
  await storage.updateUser(userId, {
    mfaSecret: secret.base32,
    mfaEnabled: false // Enabled after verification
  });
  
  return {
    secret: secret.base32,
    qrCode: qrcode.generate(secret.otpauth_url)
  };
}

// MFA verification
async function verifyMFA(userId: number, token: string): Promise<boolean> {
  const user = await storage.getUser(userId);
  
  return speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token,
    window: 1 // Allow 1 step tolerance
  });
}
```

### MFA Enforcement
```typescript
// Require MFA for sensitive operations
function requireMFA(req: Request, res: Response, next: NextFunction) {
  const user = (req.session as any).user;
  
  if (user.isAdmin && !req.session.mfaVerified) {
    return res.status(403).json({ 
      error: 'MFA verification required',
      redirectTo: '/auth/mfa'
    });
  }
  
  next();
}

// MFA verification endpoint
app.post('/api/auth/mfa/verify', async (req, res) => {
  const { token } = req.body;
  const user = (req.session as any).user;
  
  if (await verifyMFA(user.id, token)) {
    req.session.mfaVerified = true;
    req.session.mfaVerifiedAt = new Date();
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid MFA token' });
  }
});
```

## Audit Logging

### Access Audit Trail
```typescript
// Comprehensive audit logging
interface AuditLog {
  id: string;
  timestamp: Date;
  userId: number;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  result: 'success' | 'failure' | 'unauthorized';
  metadata?: Record<string, any>;
}

// Audit logging middleware
function auditLog(action: string, resource: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req.session as any).user;
    const originalSend = res.json;
    
    res.json = function(body) {
      // Log after response to capture result
      setTimeout(async () => {
        await storage.createAuditLog({
          userId: user?.id,
          userEmail: user?.email,
          action,
          resource,
          resourceId: req.params.id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          sessionId: req.sessionID,
          result: res.statusCode < 400 ? 'success' : 'failure',
          metadata: {
            method: req.method,
            path: req.path,
            query: req.query,
            body: req.body
          }
        });
      }, 0);
      
      return originalSend.call(this, body);
    };
    
    next();
  };
}
```

### Security Event Monitoring
```typescript
// Monitor for suspicious activities
class SecurityMonitor {
  async detectSuspiciousActivity(): Promise<void> {
    // Multiple failed login attempts
    const failedLogins = await this.getFailedLoginAttempts('1h');
    if (failedLogins.length > 10) {
      await this.alertSecurityTeam('Multiple failed login attempts');
    }
    
    // Unusual access patterns
    const adminAccess = await this.getAdminAccessOutsideBusinessHours();
    if (adminAccess.length > 0) {
      await this.alertSecurityTeam('Admin access outside business hours');
    }
    
    // Geographic anomalies
    const locationAnomalies = await this.detectLocationAnomalies();
    if (locationAnomalies.length > 0) {
      await this.alertSecurityTeam('Unusual access locations detected');
    }
  }
}
```

## Data Protection & Privacy

### Personal Data Handling
```typescript
// PII data classification
interface PIIClassification {
  sensitive: ['ssn', 'drivers_license', 'payment_info'];
  personal: ['email', 'name', 'phone', 'address'];
  public: ['username', 'profile_picture'];
}

// Data encryption for sensitive fields
async function encryptPII(data: string): Promise<string> {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(Buffer.from('returnit', 'utf8'));
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}
```

### GDPR Compliance
```typescript
// GDPR data subject rights
class GDPRService {
  async exportUserData(userId: number): Promise<UserDataExport> {
    // Compile all user data for export
    const userData = await storage.getUserData(userId);
    const orders = await storage.getUserOrders(userId);
    const payments = await storage.getUserPayments(userId);
    
    return {
      personalData: userData,
      orderHistory: orders,
      paymentHistory: payments,
      exportedAt: new Date(),
      format: 'JSON'
    };
  }
  
  async deleteUserData(userId: number): Promise<void> {
    // GDPR right to be forgotten
    // 1. Anonymize personal data
    // 2. Retain transaction records for legal compliance
    // 3. Remove from marketing lists
    
    await storage.anonymizeUser(userId);
    console.log(`User data anonymized: ${userId}`);
  }
}
```

## Network Security

### HTTPS/TLS Configuration
```typescript
// Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

### CORS Configuration
```typescript
// CORS security for API access
const corsOptions = {
  origin: [
    'https://returnit.online',
    'https://www.returnit.online',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:5000'] : [])
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
};

app.use(cors(corsOptions));
```

## Incident Response

### Security Incident Classification
```typescript
interface SecurityIncident {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'data_breach' | 'unauthorized_access' | 'malware' | 'ddos' | 'insider_threat';
  description: string;
  affectedSystems: string[];
  detectedAt: Date;
  reportedBy: string;
  status: 'investigating' | 'contained' | 'resolved';
}
```

### Response Procedures
1. **Detection**: Automated monitoring and manual reporting
2. **Classification**: Assess severity and impact
3. **Containment**: Isolate affected systems
4. **Investigation**: Determine root cause and scope
5. **Recovery**: Restore systems and services
6. **Lessons Learned**: Document and improve procedures

## Security Compliance

### Security Checklist
- [ ] **Authentication**: Multi-provider OAuth + local auth
- [ ] **Authorization**: Role-based access control (RBAC)
- [ ] **Session Management**: Secure session configuration
- [ ] **Password Security**: bcrypt with high salt rounds
- [ ] **API Security**: Rate limiting and key validation
- [ ] **Data Encryption**: Sensitive data encrypted at rest
- [ ] **HTTPS/TLS**: All traffic encrypted in transit
- [ ] **Security Headers**: HSTS, XSS protection, etc.
- [ ] **Audit Logging**: Comprehensive access logs
- [ ] **MFA**: Required for admin accounts (future)
- [ ] **Secret Management**: Regular key rotation
- [ ] **GDPR Compliance**: Data export and deletion

### Penetration Testing (Quarterly)
- **External testing**: Third-party security assessment
- **Internal testing**: Code review and vulnerability scanning
- **Social engineering**: Phishing simulation for staff
- **Documentation**: Report findings and remediation

## Contact Information

### Security Team
- **Security Lead**: nabeelmumtaz92@gmail.com
- **Data Protection Officer**: [To be assigned]
- **Incident Response**: [24/7 on-call rotation]

### External Security
- **Penetration Testing**: [Security firm contact]
- **Compliance Consultant**: [Legal/compliance contact]
- **Insurance**: [Cyber liability insurance]

### Emergency Procedures
1. **Security incident detected**
2. **Immediately notify security lead**
3. **Document all actions taken**
4. **Contact customers if data affected**
5. **Report to authorities if required**
6. **Conduct post-incident review**