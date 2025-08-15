import { z } from "zod";

// Simple password validation
export const passwordSchema = z.string()
  .min(1, "Password is required");

// Simple email validation
export const emailSchema = z.string()
  .email("Please enter a valid email address");

// Simple phone validation
export const phoneSchema = z.string().optional();

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