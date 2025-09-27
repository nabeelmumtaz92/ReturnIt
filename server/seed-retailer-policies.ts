/**
 * Seed Real Retailer Return Policies
 * 
 * This script seeds the database with accurate return policies from major retailers
 * based on current 2025 research from their official websites and APIs.
 */

import { storage } from './storage.js';

// Real retailer return policies based on 2025 research
const retailerPolicies = [
  {
    merchantId: 'target-corp',
    storeName: 'Target',
    policy: {
      returnWindowDays: 90, // Standard return window
      receiptRequired: false, // Up to $100/year without receipt
      tagsRequired: false, // Not strictly required
      originalPackagingRequired: false, // Not required for most items
      allowedCategories: [
        'Electronics', 'Clothing', 'Home', 'Toys', 'Books', 'Health & Beauty',
        'Sports & Outdoors', 'Baby', 'Grocery', 'Garden & Patio'
      ],
      excludedCategories: [], // Target accepts most returns
      specialRules: {
        electronics: { returnWindowDays: 30 }, // Electronics have shorter window
        apple: { returnWindowDays: 15 }, // Apple products only 15 days
        mobilePhones: { 
          returnWindowDays: 14, 
          restockingFee: { enabled: true, amount: 35 } // $35 if opened
        },
        targetBrands: { 
          returnWindowDays: 365, // Cat & Jack, Good & Gather 1 year guarantee
          brands: ['Cat & Jack', 'Good & Gather', 'Everspring', 'Brightroom']
        }
      },
      holidayExtension: {
        enabled: true,
        start: '2024-10-01', // Items purchased Oct 1-Dec 24
        end: '2025-01-31', // Can be returned through January
        description: 'Holiday returns extended through January'
      },
      refundMethod: 'original_payment' as const, // Full refund to original payment
      membershipBenefits: {
        redcard: {
          extraDays: 30, // RedCard holders get additional 30 days
          description: '120 days total return window with RedCard'
        }
      },
      noReceiptLimit: 100, // $100 annual limit without receipt
      restockingFee: { enabled: false, percentage: 0 }
    },
    isActive: true,
    lastUpdatedBy: 'system',
    notes: 'Target return policy updated 2025 - most generous among major retailers'
  },
  
  {
    merchantId: 'macys-inc',
    storeName: "Macy's",
    policy: {
      returnWindowDays: 30, // Standard 30-day window
      receiptRequired: false, // Store credit at lowest price without receipt
      tagsRequired: false, // Not strictly required
      originalPackagingRequired: false, // Not required
      allowedCategories: [
        'Clothing', 'Shoes', 'Handbags', 'Jewelry', 'Beauty', 'Home',
        'Electronics', 'Furniture'
      ],
      excludedCategories: ['Last Act', 'Clearance Items'], // Final sale items
      specialRules: {
        designer: { 
          returnWindowDays: 14, // Designer brands only 14 days
          brands: ['Gucci', 'Burberry', 'Louis Vuitton', 'Prada']
        },
        apple: { returnWindowDays: 14 }, // Apple products 14 days
        jewelry: { returnWindowDays: 30 }, // Fine jewelry 30 days
        areaRugs: { 
          returnWindowDays: 30,
          storeRestriction: 'Fine Rug Gallery stores only'
        },
        beauty: { 
          condition: 'new_or_gently_used',
          description: 'Beauty products accepted new or gently used'
        }
      },
      holidayExtension: {
        enabled: true,
        start: '2024-10-02', // Items purchased Oct 2-Dec 24
        end: '2025-01-31', // Returns through January 31
        description: 'Holiday returns extended through January 31',
        appleOverride: {
          start: '2024-12-02',
          end: '2025-01-07' // Apple products different dates
        }
      },
      refundMethod: 'original_payment' as const, // With receipt
      noReceiptRefund: 'store_credit' as const, // Store credit at lowest selling price
      membershipBenefits: {
        starRewards: {
          freeShipping: true,
          description: 'Free return shipping for Star Rewards members'
        }
      },
      returnShipping: {
        memberFee: 0, // Free for Star Rewards
        nonMemberFee: 9.99 // $9.99 for others
      },
      restockingFee: { enabled: false, percentage: 0 }
    },
    isActive: true,
    lastUpdatedBy: 'system',
    notes: "Macy's return policy - shorter windows but flexible on condition"
  },

  {
    merchantId: 'walmart-inc',
    storeName: 'Walmart',
    policy: {
      returnWindowDays: 90, // Most items 90 days
      receiptRequired: false, // Returns possible without receipt
      tagsRequired: false, // Not required
      originalPackagingRequired: false, // Not required
      allowedCategories: [
        'Electronics', 'Clothing', 'Home', 'Toys', 'Grocery', 'Health & Beauty',
        'Sports & Outdoors', 'Baby', 'Automotive', 'Garden'
      ],
      excludedCategories: ['Digital Downloads', 'Prescription Drugs'],
      specialRules: {
        electronics: { returnWindowDays: 30 }, // Electronics 30 days
        groceryPerishable: { returnWindowDays: 7 }, // Perishable items 7 days
        firearms: { returnWindowDays: 3 }, // Firearms very short window
        tobacco: { returnWindowDays: 0 } // No tobacco returns
      },
      holidayExtension: {
        enabled: true,
        start: '2024-10-01',
        end: '2025-01-31',
        description: 'Extended holiday returns'
      },
      refundMethod: 'original_payment' as const,
      apiSupport: {
        available: true,
        webhooks: true,
        description: 'Full Walmart Returns API integration available'
      },
      restockingFee: { enabled: false, percentage: 0 }
    },
    isActive: true,
    lastUpdatedBy: 'system',
    notes: 'Walmart return policy with full API integration support'
  },

  {
    merchantId: 'amazon-com',
    storeName: 'Amazon',
    policy: {
      returnWindowDays: 30, // Standard Amazon return window
      receiptRequired: false, // Digital receipts in account
      tagsRequired: false, // Not required
      originalPackagingRequired: true, // Generally required for electronics
      allowedCategories: [
        'Electronics', 'Books', 'Clothing', 'Home & Kitchen', 'Toys',
        'Health & Beauty', 'Sports & Outdoors', 'Baby Products'
      ],
      excludedCategories: [
        'Digital Content', 'Gift Cards', 'Grocery (perishable)',
        'Custom/Personalized Items'
      ],
      specialRules: {
        electronics: { 
          returnWindowDays: 30,
          originalPackagingRequired: true,
          restockingFee: { enabled: true, percentage: 20 } // Some electronics
        },
        clothing: { returnWindowDays: 30, tryOnPolicy: true },
        books: { returnWindowDays: 30 },
        digitalContent: { returnWindowDays: 0 } // No returns on digital
      },
      holidayExtension: {
        enabled: true,
        start: '2024-11-01',
        end: '2025-01-31',
        description: 'Holiday returns extended'
      },
      refundMethod: 'original_payment' as const,
      primeMembers: {
        freeReturnShipping: true,
        description: 'Free return shipping for Prime members'
      },
      restockingFee: { 
        enabled: true, 
        percentage: 20, // Some categories
        categories: ['Large Electronics', 'Laptops']
      }
    },
    isActive: true,
    lastUpdatedBy: 'system',
    notes: 'Amazon return policy - varies by category with Prime benefits'
  },

  {
    merchantId: 'best-buy-inc',
    storeName: 'Best Buy',
    policy: {
      returnWindowDays: 15, // Standard Best Buy return window
      receiptRequired: true, // Generally required for electronics
      tagsRequired: false, // Not strictly required
      originalPackagingRequired: true, // Required for most electronics
      allowedCategories: [
        'Electronics', 'Computers', 'Mobile Phones', 'Gaming',
        'Appliances', 'Audio & Video', 'Smart Home'
      ],
      excludedCategories: [
        'Digital Downloads', 'Gift Cards', 'Labor/Services',
        'Custom Installations'
      ],
      specialRules: {
        mobilePhones: { 
          returnWindowDays: 14,
          restockingFee: { enabled: true, amount: 45 } // $45 restocking fee
        },
        appliances: { returnWindowDays: 30 }, // Major appliances 30 days
        openedSoftware: { 
          returnWindowDays: 15,
          restockingFee: { enabled: true, percentage: 15 }
        }
      },
      membershipBenefits: {
        myBestBuy: {
          extraDays: 30, // Extended return windows
          description: 'My Best Buy members get extended returns'
        },
        totalTech: {
          extraDays: 60, // Even longer for Totaltech members
          description: 'Totaltech members get 60+ day returns'
        }
      },
      holidayExtension: {
        enabled: true,
        start: '2024-11-01',
        end: '2025-01-14',
        description: 'Holiday returns extended through January 14'
      },
      refundMethod: 'original_payment' as const,
      restockingFee: { 
        enabled: true, 
        amount: 45, // Flat fee for phones
        percentage: 15 // Percentage for software
      }
    },
    isActive: true,
    lastUpdatedBy: 'system',
    notes: 'Best Buy electronics-focused return policy with membership tiers'
  }
];

export async function seedRetailerPolicies() {
  console.log('🌱 Starting retailer policy seeding...');
  
  const results = [];
  
  for (const policy of retailerPolicies) {
    try {
      // Check if policy already exists
      const existing = await storage.getMerchantPolicyByStoreName(policy.storeName);
      
      if (existing) {
        console.log(`✅ ${policy.storeName} policy already exists, skipping...`);
        results.push({ store: policy.storeName, status: 'exists', id: existing.id });
        continue;
      }
      
      // Create new policy
      const newPolicy = await storage.createMerchantPolicy(policy);
      console.log(`✅ Created ${policy.storeName} return policy (ID: ${newPolicy.id})`);
      results.push({ store: policy.storeName, status: 'created', id: newPolicy.id });
      
    } catch (error) {
      console.error(`❌ Failed to create ${policy.storeName} policy:`, error);
      results.push({ store: policy.storeName, status: 'error', error: String(error) });
    }
  }
  
  console.log('🎉 Retailer policy seeding completed!');
  console.log('Summary:', results);
  
  return results;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRetailerPolicies()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}