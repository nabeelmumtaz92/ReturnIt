// Time calculation utilities for delivery estimates and payment caps

export interface TimeEstimate {
  estimatedMinutes: number;
  timeCapMinutes: number; // Estimated ± 10 minutes
  estimatedDeliveryTime: Date;
}

/**
 * Calculate estimated delivery time based on route info
 * @param routeDistanceMiles - Distance in miles
 * @param avgSpeedMph - Average speed (default 30 mph in city)
 * @returns Time estimate with cap
 */
export function calculateEstimatedTime(
  routeDistanceMiles: number,
  avgSpeedMph: number = 30
): TimeEstimate {
  // Base time: distance / speed
  const baseTimeMinutes = (routeDistanceMiles / avgSpeedMph) * 60;
  
  // Add buffer for pickup/dropoff (5 minutes each)
  const pickupDropoffBuffer = 10;
  
  // Total estimated time
  const estimatedMinutes = Math.ceil(baseTimeMinutes + pickupDropoffBuffer);
  
  // Time cap: estimated ± 10 minutes
  const timeCapMinutes = estimatedMinutes + 10;
  
  // Calculate estimated delivery timestamp
  const estimatedDeliveryTime = new Date(Date.now() + estimatedMinutes * 60 * 1000);
  
  return {
    estimatedMinutes,
    timeCapMinutes,
    estimatedDeliveryTime
  };
}

/**
 * Calculate billable time with cap enforcement
 * @param actualMinutes - Actual time taken for delivery
 * @param estimatedMinutes - Original estimated time
 * @returns Billable time (capped at estimated + 10 min or estimated - 10 min minimum)
 */
export function calculateBillableTime(
  actualMinutes: number,
  estimatedMinutes: number
): number {
  const minTime = Math.max(estimatedMinutes - 10, 0); // Can't go below estimated - 10 min
  const maxTime = estimatedMinutes + 10; // Can't exceed estimated + 10 min
  
  // Cap actual time within the range
  return Math.min(Math.max(actualMinutes, minTime), maxTime);
}

/**
 * Calculate actual duration from pickup to dropoff
 * @param pickupTime - When driver picked up package
 * @param dropoffTime - When driver dropped off package
 * @returns Duration in minutes
 */
export function calculateActualDuration(
  pickupTime: Date,
  dropoffTime: Date
): number {
  const durationMs = dropoffTime.getTime() - pickupTime.getTime();
  return Math.ceil(durationMs / (60 * 1000)); // Convert to minutes
}

/**
 * Format minutes into human-readable time
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "15 min" or "1 hr 15 min")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${mins} min`;
}

/**
 * Get time-based payment multiplier based on time of day
 * @param timestamp - Delivery timestamp
 * @returns Multiplier (1.0 normal, 1.2 peak hours)
 */
export function getTimePeakMultiplier(timestamp: Date = new Date()): number {
  const hour = timestamp.getHours();
  
  // Peak hours: 5-7pm weekdays (rush hour)
  const isWeekday = timestamp.getDay() >= 1 && timestamp.getDay() <= 5;
  const isPeakHour = hour >= 17 && hour < 19;
  
  return isWeekday && isPeakHour ? 1.2 : 1.0;
}

/**
 * Calculate ETA from current time
 * @param estimatedMinutes - Estimated duration
 * @returns ETA timestamp and formatted string
 */
export function calculateETA(estimatedMinutes: number): {
  eta: Date;
  etaFormatted: string;
} {
  const eta = new Date(Date.now() + estimatedMinutes * 60 * 1000);
  
  const hours = eta.getHours();
  const minutes = eta.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  const etaFormatted = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  
  return {
    eta,
    etaFormatted
  };
}

/**
 * Example usage and explanations
 */
export function getTimeEstimateExplanation(
  routeDistanceMiles: number,
  estimatedMinutes: number,
  timeCapMinutes: number
): string {
  return `
Time Estimate Breakdown:

Route Distance: ${routeDistanceMiles.toFixed(1)} miles
Estimated Time: ${formatDuration(estimatedMinutes)}
Time Cap (for payment): ${formatDuration(timeCapMinutes)}

How it works:
• Estimated time is based on route distance and average city speed (30 mph)
• We add 10 minutes buffer for pickup and dropoff
• Payment is calculated based on ACTUAL time, but capped at:
  - Minimum: Estimated time - 10 minutes
  - Maximum: Estimated time + 10 minutes
  
Example:
If estimated is 30 minutes:
• Driver takes 25 minutes → Paid for 25 minutes ✓
• Driver takes 35 minutes → Paid for 35 minutes ✓  
• Driver takes 45 minutes → Paid for 40 minutes (capped) ✓
• Driver takes 18 minutes → Paid for 20 minutes (minimum) ✓
`;
}
