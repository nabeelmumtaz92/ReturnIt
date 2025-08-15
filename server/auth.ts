import bcrypt from 'bcrypt';
import { registrationSchema, loginSchema } from '@shared/validation';

// Security configuration
const SALT_ROUNDS = 12;
const MIN_SALT_ROUNDS = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export interface LoginAttempt {
  email: string;
  attempts: number;
  lastAttempt: Date;
  lockedUntil?: Date;
}

// In-memory storage for login attempts (in production, use database)
const loginAttempts = new Map<string, LoginAttempt>();

export class AuthService {
  /**
   * Hash a password using bcrypt with salt
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if password meets security requirements
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    try {
      registrationSchema.parse({ 
        password, 
        confirmPassword: password,
        email: 'test@example.com', 
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890'
      });
      return { isValid: true, errors: [] };
    } catch (error: any) {
      const passwordErrors = error.issues?.filter((issue: any) => 
        issue.path[0] === 'password'
      ).map((issue: any) => issue.message) || ['Invalid password'];
      return { isValid: passwordErrors.length === 0, errors: passwordErrors };
    }
  }

  /**
   * Check if email is valid
   */
  static validateEmail(email: string): { isValid: boolean; errors: string[] } {
    try {
      loginSchema.parse({ email, password: 'TempPassword123!' });
      return { isValid: true, errors: [] };
    } catch (error: any) {
      const emailErrors = error.issues?.filter((issue: any) => 
        issue.path[0] === 'email'
      ).map((issue: any) => issue.message) || ['Invalid email'];
      return { isValid: emailErrors.length === 0, errors: emailErrors };
    }
  }

  /**
   * Check if user is locked out due to failed attempts
   */
  static isUserLockedOut(email: string): boolean {
    const attempt = loginAttempts.get(email.toLowerCase());
    if (!attempt) return false;

    if (attempt.lockedUntil && attempt.lockedUntil > new Date()) {
      return true;
    }

    // Clear expired lockout
    if (attempt.lockedUntil && attempt.lockedUntil <= new Date()) {
      attempt.lockedUntil = undefined;
      attempt.attempts = 0;
    }

    return false;
  }

  /**
   * Record a failed login attempt
   */
  static recordFailedAttempt(email: string): void {
    const normalizedEmail = email.toLowerCase();
    const now = new Date();
    let attempt = loginAttempts.get(normalizedEmail);

    if (!attempt) {
      attempt = {
        email: normalizedEmail,
        attempts: 0,
        lastAttempt: now
      };
      loginAttempts.set(normalizedEmail, attempt);
    }

    // Reset attempts if last attempt was more than 15 minutes ago
    if (now.getTime() - attempt.lastAttempt.getTime() > LOCKOUT_TIME) {
      attempt.attempts = 0;
    }

    attempt.attempts += 1;
    attempt.lastAttempt = now;

    // Lock user if max attempts reached
    if (attempt.attempts >= MAX_LOGIN_ATTEMPTS) {
      attempt.lockedUntil = new Date(now.getTime() + LOCKOUT_TIME);
    }
  }

  /**
   * Clear failed attempts on successful login
   */
  static clearFailedAttempts(email: string): void {
    loginAttempts.delete(email.toLowerCase());
  }

  /**
   * Get remaining lockout time in minutes
   */
  static getRemainingLockoutTime(email: string): number {
    const attempt = loginAttempts.get(email.toLowerCase());
    if (!attempt?.lockedUntil) return 0;

    const remaining = attempt.lockedUntil.getTime() - Date.now();
    return Math.ceil(remaining / (60 * 1000)); // Convert to minutes
  }

  /**
   * Generate secure session token
   */
  static generateSessionToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => 
      byte.toString(16).padStart(2, '0')
    ).join('');
  }

  /**
   * Sanitize user data for safe storage/transmission
   */
  static sanitizeUserData(user: any): any {
    const { password, hashedPassword, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Check password strength and provide feedback
   */
  static getPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isSecure: boolean;
  } {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score += 1;
    else feedback.push("Use at least 8 characters");

    if (password.length >= 12) score += 1;
    else if (password.length >= 8) feedback.push("Consider using 12+ characters");

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("Add lowercase letters");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("Add uppercase letters");

    if (/\d/.test(password)) score += 1;
    else feedback.push("Add numbers");

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else feedback.push("Add special characters");

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      score -= 1;
      feedback.push("Avoid repeated characters");
    }

    if (/012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
      score -= 1;
      feedback.push("Avoid sequential characters");
    }

    return {
      score: Math.max(0, score),
      feedback,
      isSecure: score >= 4 && feedback.length === 0
    };
  }
}

export default AuthService;