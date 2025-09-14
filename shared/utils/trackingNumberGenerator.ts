import { randomBytes } from 'crypto';

/**
 * Generates a unique tracking number with RTN- prefix
 * Format: RTN-XXXXXXXX (8-12 alphanumeric characters)
 * Uses secure random bytes to ensure uniqueness
 */
export function generateTrackingNumber(): string {
  // Generate 8 random bytes (will create 16 hex chars, we'll take 8-10)
  const randomData = randomBytes(6);
  
  // Convert to base32-like encoding using only alphanumeric characters
  // to avoid confusion with similar looking characters (0/O, 1/I)
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 chars, no 0,O,1,I
  
  let result = '';
  let buffer = 0;
  let bitsInBuffer = 0;
  
  // Use Array.from() to handle Buffer iteration safely
  for (const byte of Array.from(randomData)) {
    buffer = (buffer << 8) | byte;
    bitsInBuffer += 8;
    
    while (bitsInBuffer >= 5) {
      const index = (buffer >> (bitsInBuffer - 5)) & 0x1F;
      result += charset[index];
      bitsInBuffer -= 5;
    }
  }
  
  // Handle remaining bits
  if (bitsInBuffer > 0) {
    const index = (buffer << (5 - bitsInBuffer)) & 0x1F;
    result += charset[index];
  }
  
  // Ensure we have 8-10 characters, pad if necessary
  while (result.length < 8) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }
  
  // Limit to 10 characters max
  result = result.substring(0, 10);
  
  return `RTN-${result}`;
}

/**
 * Validates tracking number format
 * @param trackingNumber - The tracking number to validate
 * @returns boolean indicating if format is valid
 */
export function validateTrackingNumber(trackingNumber: string): boolean {
  const pattern = /^RTN-[A-Z0-9]{8,12}$/;
  return pattern.test(trackingNumber);
}

/**
 * Generates a tracking number with collision handling
 * @param checkExists - Function to check if tracking number already exists
 * @param maxRetries - Maximum number of retry attempts (default: 10)
 * @returns Promise<string> - Unique tracking number
 */
export async function generateUniqueTrackingNumber(
  checkExists: (trackingNumber: string) => Promise<boolean>,
  maxRetries: number = 10
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const trackingNumber = generateTrackingNumber();
    
    const exists = await checkExists(trackingNumber);
    if (!exists) {
      return trackingNumber;
    }
    
    // Log collision (very unlikely but good to track)
    console.warn(`Tracking number collision detected: ${trackingNumber}, retrying... (attempt ${attempt + 1}/${maxRetries})`);
  }
  
  throw new Error(`Failed to generate unique tracking number after ${maxRetries} attempts`);
}