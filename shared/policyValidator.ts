// ReturnIt Policy Validation System
// Enforces terms of service and prohibited items policies

export interface PolicyValidationResult {
  isValid: boolean;
  violations: string[];
  warnings: string[];
  requiresReview: boolean;
}

// Prohibited items categories based on legal restrictions and safety
const PROHIBITED_ITEMS = {
  HAZARDOUS: [
    'chemicals', 'acids', 'flammable liquids', 'batteries', 'propane', 'gasoline',
    'paint', 'aerosols', 'compressed gases', 'corrosive materials', 'toxic substances'
  ],
  ILLEGAL: [
    'drugs', 'narcotics', 'controlled substances', 'weapons', 'firearms', 'ammunition',
    'explosives', 'stolen goods', 'counterfeit items', 'illegal substances'
  ],
  RESTRICTED: [
    'alcohol', 'tobacco', 'vape products', 'adult content', 'prescription medication',
    'medical devices', 'fresh food', 'perishables', 'live animals', 'plants'
  ],
  HIGH_VALUE: [
    'jewelry', 'precious metals', 'cash', 'gift cards', 'cryptocurrency hardware',
    'collectibles', 'antiques', 'artwork'
  ],
  FRAGILE_RESTRICTED: [
    'glass items', 'ceramics', 'fragile electronics', 'liquid containers'
  ]
};

// Suspicious terms that may indicate prohibited content
const SUSPICIOUS_KEYWORDS = [
  'homemade', 'custom liquid', 'battery pack', 'unmarked', 'unlabeled',
  'experimental', 'prototype', 'modified', 'altered', 'opened medication'
];

/**
 * Validates order content against ReturnIt policies
 */
export function validateOrderPolicy(orderData: {
  itemDescription: string;
  itemCategory: string;
  retailer: string;
  itemValue: number;
  numberOfItems: number;
  estimatedWeight?: string;
}): PolicyValidationResult {
  const violations: string[] = [];
  const warnings: string[] = [];
  let requiresReview = false;

  const description = orderData.itemDescription?.toLowerCase() || '';
  const category = orderData.itemCategory?.toLowerCase() || '';

  // Check for prohibited items
  for (const [categoryName, items] of Object.entries(PROHIBITED_ITEMS)) {
    for (const item of items) {
      if (description.includes(item) || category.includes(item)) {
        if (categoryName === 'HAZARDOUS' || categoryName === 'ILLEGAL') {
          violations.push(`Prohibited item detected: ${item} (${categoryName})`);
        } else if (categoryName === 'RESTRICTED') {
          warnings.push(`Restricted item: ${item} - May require special handling`);
          requiresReview = true;
        } else if (categoryName === 'HIGH_VALUE' && orderData.itemValue > 1000) {
          warnings.push(`High-value item: ${item} - Additional verification may be required`);
          requiresReview = true;
        }
      }
    }
  }

  // Check for suspicious keywords
  for (const keyword of SUSPICIOUS_KEYWORDS) {
    if (description.includes(keyword)) {
      warnings.push(`Suspicious description contains: "${keyword}" - Manual review recommended`);
      requiresReview = true;
    }
  }

  // Value-based checks
  if (orderData.itemValue > 5000) {
    warnings.push('High-value item requires additional verification');
    requiresReview = true;
  }

  if (orderData.numberOfItems > 10) {
    warnings.push('Large quantity order - verify legitimacy');
    requiresReview = true;
  }

  // Weight-based restrictions
  if (orderData.estimatedWeight) {
    const weight = parseFloat(orderData.estimatedWeight);
    if (weight > 50) {
      violations.push('Item exceeds maximum weight limit (50 lbs)');
    } else if (weight > 30) {
      warnings.push('Heavy item - may require special handling');
    }
  }

  // Retailer verification
  const knownRetailers = [
    'amazon', 'walmart', 'target', 'best buy', 'macys', 'nordstrom', 'kohls',
    'home depot', 'lowes', 'costco', 'sams club', 'tj maxx', 'marshalls'
  ];
  
  const retailerLower = orderData.retailer?.toLowerCase() || '';
  const isKnownRetailer = knownRetailers.some(retailer => 
    retailerLower.includes(retailer)
  );
  
  if (!isKnownRetailer && orderData.itemValue > 500) {
    warnings.push('Unknown retailer with high-value item - verify return policy');
    requiresReview = true;
  }

  return {
    isValid: violations.length === 0,
    violations,
    warnings,
    requiresReview
  };
}

/**
 * Validates driver compliance and background requirements
 */
export function validateDriverCompliance(driverData: {
  backgroundCheckStatus?: string;
  documentsVerified?: boolean;
  isActive?: boolean;
  recentViolations?: number;
}): PolicyValidationResult {
  const violations: string[] = [];
  const warnings: string[] = [];
  let requiresReview = false;

  // Background check requirements
  if (driverData.backgroundCheckStatus !== 'approved') {
    violations.push('Background check must be approved before activation');
  }

  // Document verification
  if (!driverData.documentsVerified) {
    violations.push('All required documents must be verified');
  }

  // Recent violations check
  if (driverData.recentViolations && driverData.recentViolations > 2) {
    warnings.push('Driver has multiple recent violations');
    requiresReview = true;
  }

  return {
    isValid: violations.length === 0,
    violations,
    warnings,
    requiresReview
  };
}

/**
 * Policy enforcement levels
 */
export enum PolicyAction {
  ALLOW = 'allow',
  WARN = 'warn',
  REVIEW = 'review',
  BLOCK = 'block'
}

/**
 * Determines the appropriate action based on validation results
 */
export function determinePolicyAction(result: PolicyValidationResult): PolicyAction {
  if (!result.isValid) {
    return PolicyAction.BLOCK;
  }
  
  if (result.requiresReview) {
    return PolicyAction.REVIEW;
  }
  
  if (result.warnings.length > 0) {
    return PolicyAction.WARN;
  }
  
  return PolicyAction.ALLOW;
}

/**
 * Format policy validation results for user display
 */
export function formatPolicyMessage(result: PolicyValidationResult): string {
  if (!result.isValid) {
    return `Order cannot be processed due to policy violations: ${result.violations.join(', ')}`;
  }
  
  if (result.warnings.length > 0) {
    return `Please note: ${result.warnings.join(', ')}`;
  }
  
  return 'Order meets all policy requirements';
}