import { z } from "zod";

// Password validation schema with comprehensive requirements
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must be less than 128 characters")
  .regex(/^(?=.*[a-z])/, "Password must contain at least one lowercase letter")
  .regex(/^(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
  .regex(/^(?=.*\d)/, "Password must contain at least one number")
  .regex(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, "Password must contain at least one special character")
  .refine((password) => {
    // Check for common weak passwords
    const commonPasswords = [
      "password", "123456", "12345678", "qwerty", "abc123", 
      "password123", "admin", "letmein", "welcome", "monkey"
    ];
    return !commonPasswords.includes(password.toLowerCase());
  }, "Password is too common. Please choose a stronger password")
  .refine((password) => {
    // Check for sequential characters
    const sequential = /012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i;
    return !sequential.test(password);
  }, "Password cannot contain sequential characters")
  .refine((password) => {
    // Check for repeated characters
    const repeated = /(.)\1{2,}/;
    return !repeated.test(password);
  }, "Password cannot contain repeated characters");

// Email validation with enhanced rules
export const emailSchema = z.string()
  .email("Please enter a valid email address")
  .min(5, "Email must be at least 5 characters")
  .max(254, "Email must be less than 254 characters")
  .refine((email) => {
    // Check for disposable email domains
    const disposableDomains = [
      "10minutemail.com", "tempmail.org", "guerrillamail.com",
      "mailinator.com", "yopmail.com", "temp-mail.org"
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    return !disposableDomains.includes(domain);
  }, "Disposable email addresses are not allowed");

// Phone validation
export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]{10,15}$/, "Please enter a valid phone number")
  .refine((phone) => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  }, "Phone number must contain 10-15 digits");

// Registration validation schema
export const registrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: phoneSchema.optional(),
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  dateOfBirth: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Password strength calculation
export function calculatePasswordStrength(password: string): {
  score: number;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push("Use at least 8 characters");

  if (password.length >= 12) score += 1;
  else if (password.length >= 8) feedback.push("Consider using 12+ characters for better security");

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Add lowercase letters");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Add uppercase letters");

  if (/\d/.test(password)) score += 1;
  else feedback.push("Add numbers");

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  else feedback.push("Add special characters");

  // Additional complexity
  if (password.length >= 16) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

  const labels: Array<'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong'> = [
    'Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'
  ];

  const labelIndex = Math.min(Math.floor(score / 1.5), labels.length - 1);
  
  return {
    score: Math.min(score, 8),
    label: labels[labelIndex],
    feedback: score >= 6 ? [] : feedback
  };
}

// Rate limiting schema
export const rateLimitSchema = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: "Too many login attempts. Please try again in 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
};

export type RegistrationData = z.infer<typeof registrationSchema>;
export type LoginData = z.infer<typeof loginSchema>;