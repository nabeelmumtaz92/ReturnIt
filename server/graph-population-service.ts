import { db } from './db';
import { graphNodes, graphEdges, graphPolicyRules } from '@shared/schema';
import { sql } from 'drizzle-orm';

interface StoreLocation {
  name: string;
  brand: string;
  address: string;
  coordinates: { lat: number; lng: number };
  nodeType: 'store' | 'partner_network' | 'dropoff_point';
  acceptsThirdParty: boolean;
  operatingHours?: string;
}

/**
 * Graph Population Service
 * Seeds the Return Graph with real-world store locations, partner networks, and routing edges
 */
export class GraphPopulationService {
  
  /**
   * Major retail store locations across key metro areas
   */
  private readonly storeLocations: StoreLocation[] = [
    // St. Louis Metro - Target Stores
    { 
      name: 'Target Chesterfield',
      brand: 'Target',
      address: '17060 North Outer 40 Rd, Chesterfield, MO 63005',
      coordinates: { lat: 38.6631, lng: -90.5298 },
      nodeType: 'store',
      acceptsThirdParty: true,
      operatingHours: '8am-10pm'
    },
    {
      name: 'Target Brentwood',
      brand: 'Target',
      address: '2001 Brentwood Blvd, Brentwood, MO 63144',
      coordinates: { lat: 38.6186, lng: -90.3489 },
      nodeType: 'store',
      acceptsThirdParty: true,
      operatingHours: '8am-10pm'
    },
    {
      name: 'Target South County',
      brand: 'Target',
      address: '45 South County Center, St. Louis, MO 63129',
      coordinates: { lat: 38.5181, lng: -90.3884 },
      nodeType: 'store',
      acceptsThirdParty: true,
      operatingHours: '8am-10pm'
    },
    
    // St. Louis Metro - Walmart Stores
    {
      name: 'Walmart Manchester',
      brand: 'Walmart',
      address: '141 THF Blvd, Chesterfield, MO 63005',
      coordinates: { lat: 38.5947, lng: -90.5117 },
      nodeType: 'store',
      acceptsThirdParty: false,
      operatingHours: '6am-11pm'
    },
    {
      name: 'Walmart Lemay Ferry',
      brand: 'Walmart',
      address: '4532 Lemay Ferry Rd, St. Louis, MO 63129',
      coordinates: { lat: 38.4856, lng: -90.3208 },
      nodeType: 'store',
      acceptsThirdParty: false,
      operatingHours: '6am-11pm'
    },
    
    // St. Louis Metro - Best Buy
    {
      name: 'Best Buy West County',
      brand: 'Best Buy',
      address: '13369 Olive Blvd, Chesterfield, MO 63017',
      coordinates: { lat: 38.6738, lng: -90.5121 },
      nodeType: 'store',
      acceptsThirdParty: true,
      operatingHours: '10am-9pm'
    },
    
    // St. Louis Metro - Amazon Hub Locations
    {
      name: 'Amazon Hub - Whole Foods Brentwood',
      brand: 'Amazon',
      address: '8825 Eager Rd, Brentwood, MO 63144',
      coordinates: { lat: 38.6194, lng: -90.3542 },
      nodeType: 'partner_network',
      acceptsThirdParty: true,
      operatingHours: '8am-10pm'
    },
    
    // Chicago Metro - Target Stores
    {
      name: 'Target State Street',
      brand: 'Target',
      address: '1154 S State St, Chicago, IL 60605',
      coordinates: { lat: 41.8676, lng: -87.6276 },
      nodeType: 'store',
      acceptsThirdParty: true,
      operatingHours: '8am-10pm'
    },
    {
      name: 'Target Lincoln Park',
      brand: 'Target',
      address: '2656 N Elston Ave, Chicago, IL 60647',
      coordinates: { lat: 41.9294, lng: -87.6778 },
      nodeType: 'store',
      acceptsThirdParty: true,
      operatingHours: '8am-10pm'
    },
    
    // New York Metro - Major Stores
    {
      name: 'Target East River Plaza',
      brand: 'Target',
      address: '517 E 117th St, New York, NY 10035',
      coordinates: { lat: 40.7953, lng: -73.9357 },
      nodeType: 'store',
      acceptsThirdParty: true,
      operatingHours: '8am-10pm'
    },
    {
      name: 'Best Buy Union Square',
      brand: 'Best Buy',
      address: '52 E 14th St, New York, NY 10003',
      coordinates: { lat: 40.7348, lng: -73.9910 },
      nodeType: 'store',
      acceptsThirdParty: true,
      operatingHours: '10am-9pm'
    },
    
    // Partner Networks - Happy Returns Locations
    {
      name: 'Happy Returns - Staples Chesterfield',
      brand: 'Happy Returns',
      address: '16265 Chesterfield Pkwy E, Chesterfield, MO 63017',
      coordinates: { lat: 38.6625, lng: -90.5823 },
      nodeType: 'partner_network',
      acceptsThirdParty: true,
      operatingHours: '9am-9pm'
    },
    {
      name: 'Happy Returns - Paper Source Chicago',
      brand: 'Happy Returns',
      address: '338 W Armitage Ave, Chicago, IL 60614',
      coordinates: { lat: 41.9180, lng: -87.6377 },
      nodeType: 'partner_network',
      acceptsThirdParty: true,
      operatingHours: '10am-7pm'
    },
    
    // UPS/FedEx Drop-off Points
    {
      name: 'UPS Store - Clayton MO',
      brand: 'UPS',
      address: '8000 Bonhomme Ave, Clayton, MO 63105',
      coordinates: { lat: 38.6486, lng: -90.3398 },
      nodeType: 'dropoff_point',
      acceptsThirdParty: true,
      operatingHours: '8am-7pm'
    },
    {
      name: 'FedEx Office - Downtown Chicago',
      brand: 'FedEx',
      address: '130 S Canal St, Chicago, IL 60606',
      coordinates: { lat: 41.8795, lng: -87.6394 },
      nodeType: 'dropoff_point',
      acceptsThirdParty: true,
      operatingHours: '24/7'
    }
  ];

  /**
   * Retail policy rules for major brands
   */
  private readonly policyRules = [
    {
      brand: 'Target',
      returnWindowDays: 90,
      requiresReceipt: true,
      acceptedConditions: ['new', 'like_new', 'good'],
      restockingFee: 0,
      notes: 'Accepts third-party returns with original packaging'
    },
    {
      brand: 'Walmart',
      returnWindowDays: 90,
      requiresReceipt: true,
      acceptedConditions: ['new', 'like_new'],
      restockingFee: 0,
      notes: 'Does not accept third-party returns'
    },
    {
      brand: 'Best Buy',
      returnWindowDays: 15,
      requiresReceipt: true,
      acceptedConditions: ['new', 'like_new'],
      restockingFee: 15,
      notes: 'Elite members get 30-day return window'
    },
    {
      brand: 'Amazon',
      returnWindowDays: 30,
      requiresReceipt: false,
      acceptedConditions: ['new', 'like_new', 'good', 'acceptable'],
      restockingFee: 0,
      notes: 'Amazon Hub accepts all Amazon returns'
    },
    {
      brand: 'Happy Returns',
      returnWindowDays: 365,
      requiresReceipt: false,
      acceptedConditions: ['new', 'like_new', 'good'],
      restockingFee: 0,
      notes: 'Partner network accepts returns for 1000+ brands'
    }
  ];

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Estimate travel time based on distance (assumes 40 km/h average speed)
   */
  private estimateTime(distanceKm: number): number {
    return (distanceKm / 40) * 60; // minutes
  }

  /**
   * Estimate cost based on distance ($1.50/km)
   */
  private estimateCost(distanceKm: number): number {
    return distanceKm * 1.5;
  }

  /**
   * Populate the graph with store locations
   */
  async populateNodes(): Promise<number> {
    console.log('📍 Populating graph nodes...');
    let count = 0;

    for (const location of this.storeLocations) {
      try {
        await db.insert(graphNodes).values({
          nodeType: location.nodeType,
          name: location.name,
          address: location.address,
          coordinates: location.coordinates,
          acceptsThirdPartyReturns: location.acceptsThirdParty,
          operatingHours: { data: location.operatingHours },
          isActive: true,
          // Initialize performance metrics
          successRate: 0.85, // Start with 85% baseline
          averageWaitTime: 15, // 15 minutes baseline
          customerSatisfactionScore: 4.2, // 4.2/5 baseline
          totalCompletedReturns: 0
        });
        count++;
        console.log(`  ✅ Added: ${location.name}`);
      } catch (error) {
        console.error(`  ❌ Error adding ${location.name}:`, error);
      }
    }

    console.log(`✅ Added ${count} nodes to the graph`);
    return count;
  }

  /**
   * Create edges between nearby nodes (within 25km)
   */
  async populateEdges(): Promise<number> {
    console.log('🔗 Creating edges between nearby nodes...');
    
    // Get all nodes
    const nodes = await db.select().from(graphNodes);
    let edgeCount = 0;

    // Create edges between nodes within 25km
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        const distance = this.calculateDistance(
          node1.coordinates as { lat: number; lng: number },
          node2.coordinates as { lat: number; lng: number }
        );

        // Only create edges for nearby nodes (within 25km)
        if (distance <= 25) {
          const time = this.estimateTime(distance);
          const cost = this.estimateCost(distance);

          try {
            // Create bidirectional edges
            await db.insert(graphEdges).values({
              fromNodeId: node1.id,
              toNodeId: node2.id,
              distanceKm: distance,
              estimatedTimeMinutes: Math.round(time),
              estimatedFuelCost: cost,
              trafficMultiplier: 1.0,
              acceptanceProbability: 0.9, // Start with 90% baseline
              reliabilityScore: 0.85,
              isActive: true
            });

            await db.insert(graphEdges).values({
              fromNodeId: node2.id,
              toNodeId: node1.id,
              distanceKm: distance,
              estimatedTimeMinutes: Math.round(time),
              estimatedFuelCost: cost,
              trafficMultiplier: 1.0,
              acceptanceProbability: 0.9,
              reliabilityScore: 0.85,
              isActive: true
            });

            edgeCount += 2;
            console.log(`  ✅ Edge: ${node1.name} ↔ ${node2.name} (${distance.toFixed(1)}km)`);
          } catch (error) {
            console.error(`  ❌ Error creating edge:`, error);
          }
        }
      }
    }

    console.log(`✅ Created ${edgeCount} edges`);
    return edgeCount;
  }

  /**
   * Seed policy rules for major brands
   */
  async populatePolicies(): Promise<number> {
    console.log('📋 Seeding policy rules...');
    let count = 0;

    for (const policy of this.policyRules) {
      try {
        await db.insert(graphPolicyRules).values({
          ruleName: `${policy.brand} Return Policy`,
          ruleType: 'acceptance',
          appliesToBrand: policy.brand,
          appliesToCategory: 'general',
          condition: {
            returnWindowDays: policy.returnWindowDays,
            requiresReceipt: policy.requiresReceipt,
            acceptedConditions: policy.acceptedConditions
          },
          action: {
            outcome: 'accept',
            restockingFee: policy.restockingFee,
            notes: policy.notes
          },
          confidenceScore: 0.95,
          basedOnSampleSize: 1000, // Seed data baseline
          isActive: true
        });
        count++;
        console.log(`  ✅ Policy: ${policy.brand}`);
      } catch (error) {
        console.error(`  ❌ Error adding policy for ${policy.brand}:`, error);
      }
    }

    console.log(`✅ Added ${count} policy rules`);
    return count;
  }

  /**
   * Full graph population - nodes, edges, and policies
   */
  async populateGraph(): Promise<{ nodes: number; edges: number; policies: number }> {
    console.log('🚀 Starting Return Graph population...\n');

    const nodeCount = await this.populateNodes();
    const edgeCount = await this.populateEdges();
    const policyCount = await this.populatePolicies();

    console.log('\n✨ Graph population complete!');
    console.log(`📊 Summary: ${nodeCount} nodes, ${edgeCount} edges, ${policyCount} policies`);

    return { nodes: nodeCount, edges: edgeCount, policies: policyCount };
  }

  /**
   * Clear all graph data (for re-seeding)
   */
  async clearGraph(): Promise<void> {
    console.log('🧹 Clearing existing graph data...');
    
    await db.delete(graphEdges);
    await db.delete(graphPolicyRules);
    await db.delete(graphNodes);
    
    console.log('✅ Graph cleared');
  }

  /**
   * Get graph statistics
   */
  async getGraphStats() {
    const [nodeCount] = await db.select({ count: sql<number>`count(*)` }).from(graphNodes);
    const [edgeCount] = await db.select({ count: sql<number>`count(*)` }).from(graphEdges);
    const [policyCount] = await db.select({ count: sql<number>`count(*)` }).from(graphPolicyRules);

    return {
      nodes: nodeCount?.count || 0,
      edges: edgeCount?.count || 0,
      policies: policyCount?.count || 0
    };
  }
}
