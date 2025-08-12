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
  multiBoxFee: number;
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
  multiBoxFee: number; // $1.50 per additional box
  rushFee: number; // $3 for same-day
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
  multiBoxFee: 1.50,
  rushFee: 3.00
};

export function calculatePayment(
  routeInfo: RouteInfo,
  boxSize: string = 'M',
  numberOfBoxes: number = 1,
  isRush: boolean = false,
  tip: number = 0,
  config: PaymentConfig = DEFAULT_CONFIG
): PaymentBreakdown {
  
  // Calculate base fees
  const basePrice = config.basePrice;
  const distanceFee = routeInfo.distance * config.distanceRateTotal;
  const timeFee = (routeInfo.estimatedTime / 60) * config.timeRateTotal;
  const sizeUpcharge = config.sizeUpcharges[boxSize] || 0;
  const multiBoxFee = numberOfBoxes > 1 ? (numberOfBoxes - 1) * config.multiBoxFee : 0;
  const rushFee = isRush ? config.rushFee : 0;
  
  // Calculate subtotal and service fee
  const subtotal = basePrice + distanceFee + timeFee + sizeUpcharge + multiBoxFee + rushFee;
  const serviceFee = subtotal * config.serviceFeeRate;
  const totalPrice = subtotal + serviceFee + tip;
  
  // Calculate driver earnings
  const driverBasePay = config.driverBasePay;
  const driverDistancePay = routeInfo.distance * config.driverDistanceRate;
  const driverTimePay = (routeInfo.estimatedTime / 60) * config.driverTimeRate;
  const driverSizeBonus = config.driverSizeBonuses[boxSize] || 0;
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
    multiBoxFee,
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
• Additional boxes: $${breakdown.multiBoxFee.toFixed(2)}
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