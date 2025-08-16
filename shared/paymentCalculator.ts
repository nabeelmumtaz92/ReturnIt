// Returnly Payment Calculator
// Calculates fair payment splits between drivers and company

export interface RouteInfo {
  distance: number; // in miles
  estimatedTime: number; // in minutes
}

export interface PaymentBreakdown {
  // Customer charges
  basePrice: number;
  distanceFee: number;
  timeFee: number;
  sizeUpcharge: number;
  multiItemFee: number;
  smallOrderFee: number;
  serviceFee: number;
  rushFee: number;
  subtotal: number;
  tip: number;
  totalPrice: number;
  
  // Driver earnings
  driverBasePay: number;
  driverDistancePay: number;
  driverTimePay: number;
  driverSizeBonus: number;
  driverTip: number;
  driverTotalEarning: number;
  
  // Company revenue
  companyServiceFee: number;
  companyBaseFeeShare: number;
  companyDistanceFeeShare: number;
  companyTimeFeeShare: number;
  companyTotalRevenue: number;
}

export interface PaymentConfig {
  // Base rates
  basePrice: number; // $3.99 minimum
  driverBasePay: number; // $3.00 (75% of base)
  companyBaseFeeShare: number; // $0.99 (25% of base)
  
  // Distance rates (per mile)
  distanceRateTotal: number; // $0.50 per mile total
  driverDistanceRate: number; // $0.35 per mile (70%)
  companyDistanceRate: number; // $0.15 per mile (30%)
  
  // Time rates (per hour)
  timeRateTotal: number; // $12 per hour total
  driverTimeRate: number; // $8 per hour (67%)
  companyTimeRate: number; // $4 per hour (33%)
  
  // Size bonuses
  sizeUpcharges: Record<string, number>; // L: $2, XL: $4
  driverSizeBonuses: Record<string, number>; // L: $1, XL: $2
  
  // Service fee
  serviceFeeRate: number; // 15% of subtotal
  
  // Other fees
  multiItemFee: number; // $1.00 per additional item
  rushFee: number; // $3 for same-day
  smallOrderFee: number; // $2.00 fee for orders under threshold
  smallOrderThreshold: number; // $8.00 minimum before small order fee applies
}

const DEFAULT_CONFIG: PaymentConfig = {
  basePrice: 3.99,
  driverBasePay: 3.00,
  companyBaseFeeShare: 0.99,
  
  distanceRateTotal: 0.50,
  driverDistanceRate: 0.35,
  companyDistanceRate: 0.15,
  
  timeRateTotal: 12.00,
  driverTimeRate: 8.00,
  companyTimeRate: 4.00,
  
  sizeUpcharges: {
    'S': 0,
    'M': 0,
    'L': 2.00,
    'XL': 4.00
  },
  
  driverSizeBonuses: {
    'S': 0,
    'M': 0,
    'L': 1.00,
    'XL': 2.00
  },
  
  serviceFeeRate: 0.15,
  multiItemFee: 1.00,
  rushFee: 3.00,
  smallOrderFee: 2.00,
  smallOrderThreshold: 8.00
};

// Function to determine item size based on value
export function getItemSizeByValue(itemValue: number): string {
  if (itemValue < 25) return 'S';       // Under $25 = Small
  if (itemValue < 100) return 'M';      // $25-$99 = Medium  
  if (itemValue < 300) return 'L';      // $100-$299 = Large
  return 'XL';                          // $300+ = Extra Large
}

// Value-aware payment calculation that ensures customers never pay out of pocket
export function calculatePaymentWithValue(
  routeInfo: RouteInfo,
  itemValue: number,
  numberOfItems: number = 1,
  isRush: boolean = false,
  tip: number = 0,
  config: PaymentConfig = DEFAULT_CONFIG
): PaymentBreakdown {
  const itemSize = getItemSizeByValue(itemValue);
  const standardCalculation = calculatePayment(routeInfo, itemSize, numberOfItems, isRush, tip, config);
  
  // If total cost exceeds item value, cap it at item value minus $0.01 (so customer still gets something back)
  const maxAllowableTotal = Math.max(itemValue - 0.01, 1.00); // Minimum $1.00 service
  
  if (standardCalculation.totalPrice > maxAllowableTotal) {
    // Recalculate with capped total
    const cappedTotal = maxAllowableTotal;
    const cappedSubtotal = cappedTotal - tip; // Remove tip from capped total
    const cappedServiceFee = cappedSubtotal * (config.serviceFeeRate / (1 + config.serviceFeeRate)); // Back-calculate service fee
    const cappedPreServiceTotal = cappedSubtotal - cappedServiceFee;
    
    // Proportionally reduce all fees to fit within the cap
    const originalPreServiceTotal = standardCalculation.subtotal;
    const reductionFactor = cappedPreServiceTotal / originalPreServiceTotal;
    
    return {
      ...standardCalculation,
      basePrice: standardCalculation.basePrice * reductionFactor,
      distanceFee: standardCalculation.distanceFee * reductionFactor,
      timeFee: standardCalculation.timeFee * reductionFactor,
      sizeUpcharge: standardCalculation.sizeUpcharge * reductionFactor,
      multiItemFee: standardCalculation.multiItemFee * reductionFactor,
      smallOrderFee: standardCalculation.smallOrderFee * reductionFactor,
      rushFee: standardCalculation.rushFee * reductionFactor,
      serviceFee: cappedServiceFee,
      subtotal: cappedSubtotal,
      totalPrice: cappedTotal,
      // Adjust company revenue proportionally
      companyServiceFee: cappedServiceFee,
      companyBaseFeeShare: standardCalculation.companyBaseFeeShare * reductionFactor,
      companyDistanceFeeShare: standardCalculation.companyDistanceFeeShare * reductionFactor,
      companyTimeFeeShare: standardCalculation.companyTimeFeeShare * reductionFactor,
      companyTotalRevenue: cappedServiceFee + (standardCalculation.companyBaseFeeShare * reductionFactor) + 
                          (standardCalculation.companyDistanceFeeShare * reductionFactor) + 
                          (standardCalculation.companyTimeFeeShare * reductionFactor)
    };
  }
  
  return standardCalculation;
}

export function calculatePayment(
  routeInfo: RouteInfo,
  itemSize: string = 'M',
  numberOfItems: number = 1,
  isRush: boolean = false,
  tip: number = 0,
  config: PaymentConfig = DEFAULT_CONFIG
): PaymentBreakdown {
  
  // Calculate base fees
  const basePrice = config.basePrice;
  const distanceFee = routeInfo.distance * config.distanceRateTotal;
  const timeFee = (routeInfo.estimatedTime / 60) * config.timeRateTotal;
  const sizeUpcharge = config.sizeUpcharges[itemSize] || 0;
  const multiItemFee = numberOfItems > 1 ? (numberOfItems - 1) * config.multiItemFee : 0;
  const rushFee = isRush ? config.rushFee : 0;
  
  // Calculate initial subtotal (before small order fee)
  const initialSubtotal = basePrice + distanceFee + timeFee + sizeUpcharge + multiItemFee + rushFee;
  
  // Apply small order fee if subtotal is below threshold
  const smallOrderFee = initialSubtotal < config.smallOrderThreshold ? config.smallOrderFee : 0;
  
  // Final subtotal including small order fee
  const subtotal = initialSubtotal + smallOrderFee;
  const serviceFee = subtotal * config.serviceFeeRate;
  const totalPrice = Math.min(subtotal + serviceFee + tip, 3.99 + tip); // Cap total at $3.99 + tip
  
  // Calculate driver earnings
  const driverBasePay = config.driverBasePay;
  const driverDistancePay = routeInfo.distance * config.driverDistanceRate;
  const driverTimePay = (routeInfo.estimatedTime / 60) * config.driverTimeRate;
  const driverSizeBonus = config.driverSizeBonuses[itemSize] || 0;
  const driverTip = tip; // Driver gets 100% of tip
  const driverTotalEarning = driverBasePay + driverDistancePay + driverTimePay + driverSizeBonus + driverTip;
  
  // Calculate company revenue
  const companyServiceFee = serviceFee; // Company gets 100% of service fee
  const companyBaseFeeShare = config.companyBaseFeeShare;
  const companyDistanceFeeShare = routeInfo.distance * config.companyDistanceRate;
  const companyTimeFeeShare = (routeInfo.estimatedTime / 60) * config.companyTimeRate;
  const companyTotalRevenue = companyServiceFee + companyBaseFeeShare + companyDistanceFeeShare + companyTimeFeeShare;
  
  return {
    // Customer charges
    basePrice,
    distanceFee,
    timeFee,
    sizeUpcharge,
    multiItemFee,
    smallOrderFee,
    serviceFee,
    rushFee,
    subtotal,
    tip,
    totalPrice,
    
    // Driver earnings
    driverBasePay,
    driverDistancePay,
    driverTimePay,
    driverSizeBonus,
    driverTip,
    driverTotalEarning,
    
    // Company revenue
    companyServiceFee,
    companyBaseFeeShare,
    companyDistanceFeeShare,
    companyTimeFeeShare,
    companyTotalRevenue
  };
}

// Example usage and breakdown explanations
export function getPaymentExplanation(breakdown: PaymentBreakdown): string {
  return `
Payment Breakdown:

Customer Pays:
• Base service: $${breakdown.basePrice.toFixed(2)}
• Distance (${breakdown.distanceFee > 0 ? `$0.50/mile` : 'included'}): $${breakdown.distanceFee.toFixed(2)}
• Time estimate: $${breakdown.timeFee.toFixed(2)}
• Size upcharge: $${breakdown.sizeUpcharge.toFixed(2)}
• Additional items: $${breakdown.multiItemFee.toFixed(2)}
• Small order fee: $${breakdown.smallOrderFee.toFixed(2)}
• Service fee (15%): $${breakdown.serviceFee.toFixed(2)}
• Rush delivery: $${breakdown.rushFee.toFixed(2)}
• Tip: $${breakdown.tip.toFixed(2)}
TOTAL: $${breakdown.totalPrice.toFixed(2)}

Driver Earns:
• Base pay: $${breakdown.driverBasePay.toFixed(2)}
• Distance pay ($0.35/mile): $${breakdown.driverDistancePay.toFixed(2)}
• Time pay ($8/hour): $${breakdown.driverTimePay.toFixed(2)}
• Size bonus: $${breakdown.driverSizeBonus.toFixed(2)}
• Tip (100%): $${breakdown.driverTip.toFixed(2)}
TOTAL: $${breakdown.driverTotalEarning.toFixed(2)}

Company Gets:
• Service fee: $${breakdown.companyServiceFee.toFixed(2)}
• Base fee share: $${breakdown.companyBaseFeeShare.toFixed(2)}
• Distance fee share: $${breakdown.companyDistanceFeeShare.toFixed(2)}
• Time fee share: $${breakdown.companyTimeFeeShare.toFixed(2)}
TOTAL: $${breakdown.companyTotalRevenue.toFixed(2)}
`;
}

// Validate that all money is accounted for
export function validatePaymentBreakdown(breakdown: PaymentBreakdown): {
  isValid: boolean;
  difference: number;
  explanation: string;
} {
  const totalIn = breakdown.totalPrice;
  const totalOut = breakdown.driverTotalEarning + breakdown.companyTotalRevenue;
  const difference = Math.abs(totalIn - totalOut);
  const isValid = difference < 0.01; // Allow for rounding
  
  return {
    isValid,
    difference,
    explanation: isValid 
      ? "Payment breakdown is balanced ✓" 
      : `Payment mismatch: Customer pays $${totalIn.toFixed(2)}, but driver + company = $${totalOut.toFixed(2)} (difference: $${difference.toFixed(2)})`
  };
}