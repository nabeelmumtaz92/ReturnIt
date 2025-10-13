import { db } from './db';
import { graphPolicyRules } from '@shared/schema';
import fs from 'fs/promises';
import path from 'path';

interface RetailerPolicy {
  name: string;
  category: string;
  defaultPolicy: {
    returnWindowDays: number;
    extendedWindowDays?: number;
    extendedFor?: string;
    requiresReceipt: boolean;
    requiresOriginalBuyer: boolean;
    acceptedConditions: string[];
    restockingFee: number;
    acceptsThirdParty: boolean;
  };
  specialCategories?: Record<string, any>;
  exceptions?: {
    nonReturnable?: string[];
  };
  notes?: string;
}

interface PolicyData {
  retailers: RetailerPolicy[];
  metadata?: any;
}

/**
 * Policy Import Service
 * Loads retailer return policies from JSON/CSV into the Return Graph
 */
export class PolicyImportService {
  
  /**
   * Load policies from JSON file
   */
  async importFromJSON(): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const results = { imported: 0, skipped: 0, errors: [] as string[] };
    
    try {
      const jsonPath = path.join(process.cwd(), 'server', 'data', 'retailer-policies.json');
      const fileContent = await fs.readFile(jsonPath, 'utf-8');
      const policyData: PolicyData = JSON.parse(fileContent);
      
      console.log(`📦 Importing ${policyData.retailers.length} retailer policies...`);
      
      for (const retailer of policyData.retailers) {
        try {
          // Import default policy
          await this.importRetailerPolicy(retailer);
          results.imported++;
          console.log(`  ✅ Imported: ${retailer.name}`);
        } catch (error: any) {
          results.errors.push(`${retailer.name}: ${error.message}`);
          results.skipped++;
          console.error(`  ❌ Error importing ${retailer.name}:`, error.message);
        }
      }
      
      console.log(`✅ Import complete: ${results.imported} imported, ${results.skipped} skipped`);
      return results;
    } catch (error: any) {
      results.errors.push(`File read error: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Import a single retailer's policy into graph_policy_rules
   */
  private async importRetailerPolicy(retailer: RetailerPolicy): Promise<void> {
    const policy = retailer.defaultPolicy;
    
    // Main policy rule
    await db.insert(graphPolicyRules).values({
      ruleName: `${retailer.name} Return Policy`,
      ruleType: 'acceptance',
      appliesToBrand: retailer.name,
      appliesToCategory: retailer.category,
      condition: {
        returnWindowDays: policy.returnWindowDays,
        extendedWindowDays: policy.extendedWindowDays,
        extendedFor: policy.extendedFor,
        requiresReceipt: policy.requiresReceipt,
        requiresOriginalBuyer: policy.requiresOriginalBuyer,
        acceptedConditions: policy.acceptedConditions,
        acceptsThirdParty: policy.acceptsThirdParty
      },
      action: {
        outcome: 'accept',
        restockingFee: policy.restockingFee,
        notes: retailer.notes
      },
      confidenceScore: 0.95,
      basedOnSampleSize: 1000,
      isActive: true
    });
    
    // Import special category rules if present
    if (retailer.specialCategories) {
      for (const [categoryName, categoryPolicy] of Object.entries(retailer.specialCategories)) {
        await db.insert(graphPolicyRules).values({
          ruleName: `${retailer.name} - ${categoryName}`,
          ruleType: 'acceptance',
          appliesToBrand: retailer.name,
          appliesToCategory: categoryName,
          condition: categoryPolicy,
          action: {
            outcome: 'accept',
            notes: categoryPolicy.notes
          },
          confidenceScore: 0.9,
          basedOnSampleSize: 500,
          isActive: true
        });
      }
    }
    
    // Import non-returnable exceptions if present
    if (retailer.exceptions?.nonReturnable) {
      await db.insert(graphPolicyRules).values({
        ruleName: `${retailer.name} - Non-Returnable Items`,
        ruleType: 'rejection',
        appliesToBrand: retailer.name,
        appliesToCategory: 'exceptions',
        condition: {
          itemCategories: retailer.exceptions.nonReturnable
        },
        action: {
          outcome: 'reject',
          reason: 'Item category is non-returnable per store policy'
        },
        confidenceScore: 1.0,
        basedOnSampleSize: 1000,
        isActive: true
      });
    }
  }
  
  /**
   * Get import statistics
   */
  async getImportStats() {
    const jsonPath = path.join(process.cwd(), 'server', 'data', 'retailer-policies.json');
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    const policyData: PolicyData = JSON.parse(fileContent);
    
    return {
      totalRetailers: policyData.retailers.length,
      categories: [...new Set(policyData.retailers.map(r => r.category))],
      metadata: policyData.metadata,
      sampleRetailers: policyData.retailers.slice(0, 5).map(r => ({
        name: r.name,
        category: r.category,
        returnWindow: r.defaultPolicy.returnWindowDays
      }))
    };
  }
  
  /**
   * Clear all imported policies
   */
  async clearImportedPolicies(): Promise<number> {
    const result = await db.delete(graphPolicyRules);
    return result.rowCount || 0;
  }
}

export const policyImportService = new PolicyImportService();
