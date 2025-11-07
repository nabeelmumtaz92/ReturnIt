import bcrypt from 'bcrypt';
import { db } from '../db';
import { adminPasswords, resetNonces, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export class AdminPasswordService {
  private static readonly BCRYPT_ROUNDS = 12;
  private static readonly NONCE_EXPIRY_MINUTES = 10;

  /**
   * Initialize the admin password system
   * This should be called once when setting up the system
   * 
   * @param adminUserId - The user ID of the admin
   * @param plainPassword - The plain text password (ENTER YOUR SECURE PASSWORD HERE)
   */
  static async initializeAdminPassword(adminUserId: number, plainPassword: string): Promise<void> {
    // Hash the password with bcrypt
    const passwordHash = await bcrypt.hash(plainPassword, this.BCRYPT_ROUNDS);
    
    // Check if admin password already exists
    const existing = await db
      .select()
      .from(adminPasswords)
      .where(eq(adminPasswords.userId, adminUserId))
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing password
      await db
        .update(adminPasswords)
        .set({
          passwordHash,
          tokenVersion: existing[0].tokenVersion + 1,
          lastChangedAt: new Date(),
        })
        .where(eq(adminPasswords.userId, adminUserId));
      
      console.log('✅ Admin password updated successfully');
    } else {
      // Insert new password
      await db.insert(adminPasswords).values({
        userId: adminUserId,
        passwordHash,
        tokenVersion: 1,
      });
      
      console.log('✅ Admin password initialized successfully');
    }
  }

  /**
   * Verify admin password
   * 
   * @param adminUserId - The user ID of the admin
   * @param plainPassword - The plain text password to verify
   * @returns Object with success status and token version
   */
  static async verifyAdminPassword(
    adminUserId: number,
    plainPassword: string
  ): Promise<{ success: boolean; tokenVersion?: number }> {
    const result = await db
      .select()
      .from(adminPasswords)
      .where(eq(adminPasswords.userId, adminUserId))
      .limit(1);
    
    if (result.length === 0) {
      return { success: false };
    }
    
    const adminPassword = result[0];
    const isValid = await bcrypt.compare(plainPassword, adminPassword.passwordHash);
    
    if (!isValid) {
      return { success: false };
    }
    
    return {
      success: true,
      tokenVersion: adminPassword.tokenVersion,
    };
  }

  /**
   * Change admin password
   * 
   * @param adminUserId - The user ID of the admin
   * @param currentPassword - The current password
   * @param newPassword - The new password
   * @returns Success status
   */
  static async changeAdminPassword(
    adminUserId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    // Verify current password
    const verification = await this.verifyAdminPassword(adminUserId, currentPassword);
    
    if (!verification.success) {
      return { success: false, message: 'Current password is incorrect' };
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);
    
    // Update password and increment token version
    const result = await db
      .select()
      .from(adminPasswords)
      .where(eq(adminPasswords.userId, adminUserId))
      .limit(1);
    
    if (result.length === 0) {
      return { success: false, message: 'Admin password not found' };
    }
    
    await db
      .update(adminPasswords)
      .set({
        passwordHash: newPasswordHash,
        tokenVersion: result[0].tokenVersion + 1,
        lastChangedAt: new Date(),
      })
      .where(eq(adminPasswords.userId, adminUserId));
    
    return { success: true, message: 'Password changed successfully' };
  }

  /**
   * Reset password using signed token (offline recovery)
   * 
   * @param payload - The signed payload containing reset information
   * @param signature - The signature to verify
   * @param publicKey - The public key for verification
   * @returns Success status
   */
  static async resetPasswordWithSignedToken(
    payload: {
      iat: number;
      exp: number;
      nonce: string;
      purpose: string;
      adminUserId: number;
      newPassword: string;
    },
    signature: string,
    publicKey: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verify signature
      const payloadBuffer = Buffer.from(JSON.stringify(payload));
      const signatureBuffer = Buffer.from(signature, 'base64');
      const isValid = crypto.verify('sha256', payloadBuffer, publicKey, signatureBuffer);
      
      if (!isValid) {
        return { success: false, message: 'Invalid signature' };
      }
      
      // Check timestamp
      const now = Math.floor(Date.now() / 1000);
      if (!payload.iat || !payload.exp || payload.exp < now) {
        return { success: false, message: 'Token expired' };
      }
      
      // Check purpose
      if (payload.purpose !== 'reset') {
        return { success: false, message: 'Invalid token purpose' };
      }
      
      // Check nonce
      const existingNonce = await db
        .select()
        .from(resetNonces)
        .where(eq(resetNonces.nonce, payload.nonce))
        .limit(1);
      
      if (existingNonce.length > 0 && existingNonce[0].used) {
        return { success: false, message: 'Nonce already used' };
      }
      
      // Hash new password
      const newPasswordHash = await bcrypt.hash(payload.newPassword, this.BCRYPT_ROUNDS);
      
      // Update password
      const result = await db
        .select()
        .from(adminPasswords)
        .where(eq(adminPasswords.userId, payload.adminUserId))
        .limit(1);
      
      if (result.length === 0) {
        return { success: false, message: 'Admin password not found' };
      }
      
      await db
        .update(adminPasswords)
        .set({
          passwordHash: newPasswordHash,
          tokenVersion: result[0].tokenVersion + 1,
          lastChangedAt: new Date(),
        })
        .where(eq(adminPasswords.userId, payload.adminUserId));
      
      // Mark nonce as used
      if (existingNonce.length > 0) {
        await db
          .update(resetNonces)
          .set({ used: true })
          .where(eq(resetNonces.nonce, payload.nonce));
      } else {
        await db.insert(resetNonces).values({
          nonce: payload.nonce,
          used: true,
          expiresAt: new Date(payload.exp * 1000),
        });
      }
      
      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, message: 'Internal error' };
    }
  }

  /**
   * Clean up expired nonces
   */
  static async cleanupExpiredNonces(): Promise<void> {
    const now = new Date();
    await db.delete(resetNonces).where(eq(resetNonces.expiresAt, now));
  }
}

// ============================================
// PLACEHOLDER: Enter your secure password here
// ============================================
// 
// To initialize the admin password system, uncomment and run this function ONCE:
// 
// async function setupAdminPassword() {
//   const ADMIN_USER_ID = 1; // Change this to your admin user ID
//   const SECURE_PASSWORD = "YOUR_SECURE_PASSWORD_HERE"; // <-- ENTER YOUR PASSWORD HERE
//   
//   await AdminPasswordService.initializeAdminPassword(ADMIN_USER_ID, SECURE_PASSWORD);
// }
// 
// setupAdminPassword().catch(console.error);
// ============================================
