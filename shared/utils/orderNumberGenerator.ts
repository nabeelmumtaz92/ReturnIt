/**
 * Order Number Generator
 * Generates human-friendly order numbers in format: ORD-XXXXXX
 * Example: ORD-487291
 */

export function generateOrderNumber(): string {
  // Generate 6-digit random number
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${randomNumber}`;
}

/**
 * Validate order number format
 */
export function isValidOrderNumber(orderNumber: string): boolean {
  return /^ORD-\d{6}$/.test(orderNumber);
}
