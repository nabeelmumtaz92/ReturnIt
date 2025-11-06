#!/usr/bin/env tsx

/**
 * Initialize Admin Password System
 * 
 * This script sets up the secure admin password.
 * Run this ONCE after setting your secure password below.
 */

import { AdminPasswordService } from '../services/adminPasswordService';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function initAdminPassword() {
  try {
    console.log('🔐 Initializing Admin Password System...\n');

    // ============================================
    // STEP 1: Enter your secure password here
    // ============================================
    const SECURE_PASSWORD = "YOUR_PASSWORD_HERE"; // <-- REPLACE THIS WITH YOUR ACTUAL PASSWORD
    
    if (SECURE_PASSWORD === "YOUR_PASSWORD_HERE") {
      console.error('❌ ERROR: Please set your secure password in this script first!');
      console.error('   Open server/scripts/initAdminPassword.ts and replace "YOUR_PASSWORD_HERE"');
      process.exit(1);
    }

    // Validate password strength
    if (SECURE_PASSWORD.length < 12) {
      console.error('❌ ERROR: Password must be at least 12 characters long');
      process.exit(1);
    }

    // ============================================
    // STEP 2: Find your admin user ID
    // ============================================
    
    // Option A: Find admin by email
    const ADMIN_EMAIL = "your-admin@email.com"; // <-- Update this with your admin email
    
    const adminUser = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);
    
    if (adminUser.length === 0) {
      console.error(`❌ ERROR: No user found with email: ${ADMIN_EMAIL}`);
      console.error('   Please update ADMIN_EMAIL in this script');
      process.exit(1);
    }

    const adminUserId = adminUser[0].id;
    console.log(`✓ Found admin user: ${adminUser[0].email} (ID: ${adminUserId})`);

    // ============================================
    // STEP 3: Initialize the password
    // ============================================
    
    console.log('\n🔒 Hashing password with bcrypt (cost factor: 12)...');
    await AdminPasswordService.initializeAdminPassword(adminUserId, SECURE_PASSWORD);
    
    console.log('\n✅ Admin password system initialized successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the password by making a POST request to /api/admin/password/verify');
    console.log('2. Delete or secure this script file');
    console.log('3. Never commit passwords to git!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error initializing admin password:', error);
    process.exit(1);
  }
}

// Run the initialization
initAdminPassword();
