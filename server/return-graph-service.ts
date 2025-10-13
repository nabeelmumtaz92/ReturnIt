import { db } from './db';
import { graphNodes, graphEdges, routingDecisions, nodePerformanceHistory, graphPolicyRules } from '@shared/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';

interface Coordinates {
  lat: number;
  lng: number;
}

interface PathNode {
  nodeId: number;
  gScore: number; // Actual cost from start
  fScore: number; // Estimated total cost (gScore + heuristic)
  parent: number | null;
}

interface RouteResult {
  nodeId: number;
  nodeName: string;
  address: string;
  coordinates: Coordinates;
  totalDistance: number;
  totalTime: number;
  estimatedCost: number;
  acceptanceProbability: number;
  score: number;
  path: number[];
}

interface OptimizationWeights {
  distance: number; // 0.0 to 1.0
  time: number;
  acceptance: number;
  cost: number;
}

export class ReturnGraphService {
  /**
   * Find the optimal drop-off node for a given customer location
   * Automatically uses graph traversal when edges exist, direct routing otherwise
   */
  async findOptimalDropoffNode(
    customerLocation: Coordinates,
    brand?: string,
    category?: string,
    weights: OptimizationWeights = { distance: 0.4, time: 0.3, acceptance: 0.2, cost: 0.1 }
  ): Promise<RouteResult | null> {
    // 1. Get all active nodes that can accept this return
    const eligibleTargetNodes = await this.getEligibleNodes(brand, category);
    
    if (eligibleTargetNodes.length === 0) {
      console.error('No eligible nodes found for return');
      return null;
    }

    // 2. Check if graph has any edges (enables A* traversal)
    const hasEdges = await this.graphHasEdges();

    if (hasEdges) {
      // Use graph traversal with A* when edges exist
      return await this.findOptimalRouteWithGraph(customerLocation, eligibleTargetNodes, weights);
    } else {
      // Fall back to direct routing when graph is empty
      return await this.findOptimalRouteDirect(customerLocation, eligibleTargetNodes, weights);
    }
  }

  /**
   * Check if graph has any active edges
   */
  private async graphHasEdges(): Promise<boolean> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(graphEdges)
      .where(eq(graphEdges.isActive, true));
    
    return (result?.count || 0) > 0;
  }

  /**
   * Find optimal route using A* graph traversal (when edges exist)
   */
  private async findOptimalRouteWithGraph(
    customerLocation: Coordinates,
    eligibleTargetNodes: any[],
    weights: OptimizationWeights
  ): Promise<RouteResult | null> {
    const routes: RouteResult[] = [];

    // Find nearest existing graph node to use as start
    const startNodeId = await this.findNearestGraphNode(customerLocation);
    
    if (!startNodeId) {
      // No nodes nearby, fall back to direct routing
      return await this.findOptimalRouteDirect(customerLocation, eligibleTargetNodes, weights);
    }

    // Get start node coordinates for customer→start leg
    const [startNode] = await db.select().from(graphNodes).where(eq(graphNodes.id, startNodeId));
    const customerToStartDistance = this.calculateDistance(customerLocation, startNode.coordinates as Coordinates);
    const customerToStartTime = this.estimateTime(customerToStartDistance);
    const customerToStartCost = this.estimateCost(customerToStartDistance);

    // Run A* to each eligible target
    for (const targetNode of eligibleTargetNodes) {
      const path = await this.findPathAStar(startNodeId, targetNode.id, weights);
      
      if (path.length > 0) {
        // Calculate metrics from actual traversed edges
        const routeMetrics = await this.calculateRouteMetrics(path, weights);
        
        // Add customer→start leg to total metrics
        const totalDistance = customerToStartDistance + routeMetrics.distance;
        const totalTime = customerToStartTime + routeMetrics.time;
        const totalCost = customerToStartCost + routeMetrics.cost;
        
        // Recalculate score with complete journey
        const normalizedDistance = totalDistance / 50;
        const normalizedTime = totalTime / 60;
        const normalizedCost = totalCost / 20;
        const normalizedAcceptance = 1 - routeMetrics.acceptance;
        
        const completeScore = 
          weights.distance * normalizedDistance +
          weights.time * normalizedTime +
          weights.cost * normalizedCost +
          weights.acceptance * normalizedAcceptance;
        
        routes.push({
          nodeId: targetNode.id,
          nodeName: targetNode.name,
          address: targetNode.address,
          coordinates: targetNode.coordinates as Coordinates,
          totalDistance,
          totalTime,
          estimatedCost: totalCost,
          acceptanceProbability: routeMetrics.acceptance,
          score: completeScore,
          path: path
        });
      }
    }

    if (routes.length > 0) {
      routes.sort((a, b) => a.score - b.score);
      return routes[0];
    }

    // A* found no paths, fall back to direct
    return await this.findOptimalRouteDirect(customerLocation, eligibleTargetNodes, weights);
  }

  /**
   * Find nearest existing graph node to a location
   */
  private async findNearestGraphNode(location: Coordinates): Promise<number | null> {
    const nodes = await db
      .select()
      .from(graphNodes)
      .where(and(
        eq(graphNodes.isActive, true),
        sql`${graphNodes.nodeType} != 'customer_location'` // Exclude virtual nodes
      ));

    if (nodes.length === 0) return null;

    let nearest: { node: any; distance: number } | null = null;

    for (const node of nodes) {
      const distance = this.calculateDistance(location, node.coordinates as Coordinates);
      if (!nearest || distance < nearest.distance) {
        nearest = { node, distance };
      }
    }

    return nearest?.node.id || null;
  }

  /**
   * Find optimal route using direct evaluation (when no edges exist)
   */
  private async findOptimalRouteDirect(
    customerLocation: Coordinates,
    eligibleTargetNodes: any[],
    weights: OptimizationWeights
  ): Promise<RouteResult | null> {
    const routes: RouteResult[] = [];
    
    for (const targetNode of eligibleTargetNodes) {
      const directDistance = this.calculateDistance(customerLocation, targetNode.coordinates as Coordinates);
      const estimatedTime = this.estimateTime(directDistance);
      const estimatedCost = this.estimateCost(directDistance);
      
      // Use learned node quality metrics
      const acceptanceProbability = targetNode.successRate || 0.8;
      const qualityAdjustment = targetNode.customerSatisfactionScore || 4.0;
      
      // Calculate score with learned metrics
      const normalizedDistance = directDistance / 50;
      const normalizedTime = estimatedTime / 60;
      const normalizedCost = estimatedCost / 20;
      const normalizedAcceptance = 1 - acceptanceProbability;
      const qualityBonus = (5 - qualityAdjustment) / 5;

      const combinedScore = 
        weights.distance * normalizedDistance +
        weights.time * normalizedTime +
        weights.cost * normalizedCost +
        weights.acceptance * (normalizedAcceptance + qualityBonus);

      routes.push({
        nodeId: targetNode.id,
        nodeName: targetNode.name,
        address: targetNode.address,
        coordinates: targetNode.coordinates as Coordinates,
        totalDistance: directDistance,
        totalTime: estimatedTime,
        estimatedCost,
        acceptanceProbability,
        score: combinedScore,
        path: [targetNode.id]
      });
    }

    if (routes.length === 0) return null;

    routes.sort((a, b) => a.score - b.score);
    return routes[0];
  }

  /**
   * Calculate metrics from actual traversed edges in path
   */
  private async calculateRouteMetrics(path: number[], weights: OptimizationWeights) {
    let totalDistance = 0;
    let totalTime = 0;
    let totalCost = 0;
    let minAcceptance = 1.0;

    for (let i = 0; i < path.length - 1; i++) {
      const [edge] = await db
        .select()
        .from(graphEdges)
        .where(
          and(
            eq(graphEdges.fromNodeId, path[i]),
            eq(graphEdges.toNodeId, path[i + 1])
          )
        );

      if (edge) {
        totalDistance += edge.distanceKm;
        totalTime += edge.averageCompletionTime || edge.estimatedTimeMinutes;
        totalCost += edge.estimatedFuelCost || 0;
        minAcceptance = Math.min(minAcceptance, edge.acceptanceProbability || 0.8);
      }
    }

    // Calculate combined score
    const normalizedDistance = totalDistance / 50;
    const normalizedTime = totalTime / 60;
    const normalizedCost = totalCost / 20;
    const normalizedAcceptance = 1 - minAcceptance;

    const score = 
      weights.distance * normalizedDistance +
      weights.time * normalizedTime +
      weights.cost * normalizedCost +
      weights.acceptance * normalizedAcceptance;

    return {
      distance: totalDistance,
      time: totalTime,
      cost: totalCost,
      acceptance: minAcceptance,
      score
    };
  }

  /**
   * Get all nodes that can accept a return for the given brand/category
   */
  private async getEligibleNodes(brand?: string, category?: string) {
    const nodes = await db
      .select()
      .from(graphNodes)
      .where(
        and(
          eq(graphNodes.isActive, true),
          sql`${graphNodes.successRate} > 0.5` // Only nodes with >50% success rate
        )
      );

    // Filter by brand if specified
    if (brand) {
      return nodes.filter(node => {
        if (node.acceptsAllBrands) return true;
        const acceptedBrands = node.acceptedBrands as string[];
        return acceptedBrands.includes(brand);
      });
    }

    return nodes;
  }

  /**
   * Calculate route from customer location to a specific node
   * Uses A* algorithm with multi-dimensional cost function
   */
  private async calculateRouteToNode(
    customerLocation: Coordinates,
    targetNode: any,
    weights: OptimizationWeights
  ): Promise<RouteResult | null> {
    // For now, direct route (will enhance with multi-hop routing later)
    const directDistance = this.calculateDistance(customerLocation, targetNode.coordinates as Coordinates);
    const estimatedTime = this.estimateTime(directDistance);
    const estimatedCost = this.estimateCost(directDistance);
    
    // Calculate combined score using weights
    const normalizedDistance = directDistance / 50; // Normalize to 0-1 (assuming max 50km)
    const normalizedTime = estimatedTime / 60; // Normalize to 0-1 (assuming max 60 min)
    const normalizedCost = estimatedCost / 20; // Normalize to 0-1 (assuming max $20)
    const normalizedAcceptance = 1 - (targetNode.successRate || 0.8); // Lower is better (inverted)

    const combinedScore = 
      weights.distance * normalizedDistance +
      weights.time * normalizedTime +
      weights.cost * normalizedCost +
      weights.acceptance * normalizedAcceptance;

    return {
      nodeId: targetNode.id,
      nodeName: targetNode.name,
      address: targetNode.address,
      coordinates: targetNode.coordinates,
      totalDistance: directDistance,
      totalTime: estimatedTime,
      estimatedCost,
      acceptanceProbability: targetNode.successRate || 0.8,
      score: combinedScore,
      path: [targetNode.id] // Single hop for now
    };
  }

  /**
   * A* pathfinding algorithm for multi-hop routing
   * Finds optimal path considering multiple factors
   */
  async findPathAStar(
    startNode: number,
    endNode: number,
    weights: OptimizationWeights
  ): Promise<number[]> {
    const openSet = new Map<number, PathNode>();
    const closedSet = new Set<number>();
    const cameFrom = new Map<number, number>(); // Separate map for path reconstruction
    
    // Initialize start node
    openSet.set(startNode, {
      nodeId: startNode,
      gScore: 0,
      fScore: await this.heuristic(startNode, endNode, weights),
      parent: null
    });

    while (openSet.size > 0) {
      // Get node with lowest fScore
      const current = this.getLowestFScore(openSet);
      
      if (current.nodeId === endNode) {
        // Reconstruct path using cameFrom map
        return this.reconstructPath(endNode, cameFrom);
      }

      openSet.delete(current.nodeId);
      closedSet.add(current.nodeId);

      // Get neighbors
      const neighbors = await this.getNeighbors(current.nodeId);
      
      for (const neighbor of neighbors) {
        if (closedSet.has(neighbor.toNodeId)) continue;

        const tentativeGScore = current.gScore + await this.edgeCost(
          current.nodeId,
          neighbor.toNodeId,
          weights
        );

        const existingNeighbor = openSet.get(neighbor.toNodeId);
        
        if (!existingNeighbor || tentativeGScore < existingNeighbor.gScore) {
          // Record where this node came from
          cameFrom.set(neighbor.toNodeId, current.nodeId);
          
          openSet.set(neighbor.toNodeId, {
            nodeId: neighbor.toNodeId,
            gScore: tentativeGScore,
            fScore: tentativeGScore + await this.heuristic(neighbor.toNodeId, endNode, weights),
            parent: current.nodeId
          });
        }
      }
    }

    // No path found
    return [];
  }

  /**
   * Calculate heuristic (estimated cost) from node to goal
   * Uses multi-criteria optimization
   */
  private async heuristic(
    fromNodeId: number,
    toNodeId: number,
    weights: OptimizationWeights
  ): Promise<number> {
    const [fromNode] = await db.select().from(graphNodes).where(eq(graphNodes.id, fromNodeId));
    const [toNode] = await db.select().from(graphNodes).where(eq(graphNodes.id, toNodeId));

    if (!fromNode || !toNode) return Infinity;

    const distance = this.calculateDistance(fromNode.coordinates as Coordinates, toNode.coordinates as Coordinates);
    const time = this.estimateTime(distance);
    const cost = this.estimateCost(distance);

    // Normalize and combine
    const normalizedDistance = distance / 50;
    const normalizedTime = time / 60;
    const normalizedCost = cost / 20;

    return (
      weights.distance * normalizedDistance +
      weights.time * normalizedTime +
      weights.cost * normalizedCost
    );
  }

  /**
   * Calculate actual edge cost between two nodes
   */
  private async edgeCost(
    fromNodeId: number,
    toNodeId: number,
    weights: OptimizationWeights
  ): Promise<number> {
    const [edge] = await db
      .select()
      .from(graphEdges)
      .where(
        and(
          eq(graphEdges.fromNodeId, fromNodeId),
          eq(graphEdges.toNodeId, toNodeId),
          eq(graphEdges.isActive, true)
        )
      );

    if (!edge) return Infinity;

    // Use learned weights if available, otherwise use defaults
    const distance = edge.distanceKm;
    const time = edge.averageCompletionTime || edge.estimatedTimeMinutes;
    const cost = edge.estimatedFuelCost || 0;
    const acceptance = 1 - (edge.acceptanceProbability || 0.8);

    // Normalize
    const normalizedDistance = distance / 50;
    const normalizedTime = time / 60;
    const normalizedCost = cost / 20;

    return (
      weights.distance * normalizedDistance +
      weights.time * normalizedTime +
      weights.cost * normalizedCost +
      weights.acceptance * acceptance
    ) * (edge.reliabilityScore || 1.0); // Apply reliability multiplier
  }

  /**
   * Get all outgoing edges from a node
   */
  private async getNeighbors(nodeId: number) {
    return await db
      .select()
      .from(graphEdges)
      .where(
        and(
          eq(graphEdges.fromNodeId, nodeId),
          eq(graphEdges.isActive, true)
        )
      );
  }

  /**
   * Get node with lowest fScore from open set
   */
  private getLowestFScore(openSet: Map<number, PathNode>): PathNode {
    let lowest: PathNode | null = null;
    
    for (const [_, node] of Array.from(openSet.entries())) {
      if (!lowest || node.fScore < lowest.fScore) {
        lowest = node;
      }
    }
    
    return lowest!;
  }

  /**
   * Reconstruct path from A* result using cameFrom map
   */
  private reconstructPath(endNodeId: number, cameFrom: Map<number, number>): number[] {
    const path: number[] = [endNodeId];
    let current = endNodeId;

    while (cameFrom.has(current)) {
      current = cameFrom.get(current)!;
      path.unshift(current);
    }

    return path;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(coord2.lat - coord1.lat);
    const dLon = this.toRad(coord2.lng - coord1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(coord1.lat)) * Math.cos(this.toRad(coord2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Estimate time based on distance (average 40 km/h in city)
   */
  private estimateTime(distanceKm: number): number {
    return Math.round((distanceKm / 40) * 60); // minutes
  }

  /**
   * Estimate cost based on distance ($0.50 per km)
   */
  private estimateCost(distanceKm: number): number {
    return distanceKm * 0.50;
  }

  /**
   * Log routing decision for ML training
   */
  async logRoutingDecision(
    orderId: string,
    customerId: number | null,
    driverId: number | null,
    pickedNodeId: number,
    alternativeNodeIds: number[],
    algorithm: string,
    criteria: string,
    weights: OptimizationWeights,
    predictions: {
      distance: number;
      time: number;
      acceptanceProbability: number;
      cost: number;
    }
  ): Promise<number> {
    const [result] = await db.insert(routingDecisions).values({
      orderId,
      customerId,
      driverId,
      pickedNodeId,
      alternativeNodeIds: alternativeNodeIds as any,
      algorithmUsed: algorithm,
      optimizationCriteria: criteria,
      weightDistance: weights.distance,
      weightTime: weights.time,
      weightAcceptance: weights.acceptance,
      weightCost: weights.cost,
      predictedDistance: predictions.distance,
      predictedTime: predictions.time,
      predictedAcceptanceProbability: predictions.acceptanceProbability,
      predictedCost: predictions.cost
    }).returning({ id: routingDecisions.id });

    return result.id;
  }

  /**
   * Update routing decision with actual results (for learning)
   */
  async updateRoutingDecisionActuals(
    decisionId: number,
    actuals: {
      distance: number;
      time: number;
      wasAccepted: boolean;
      cost: number;
      wasSuccessful: boolean;
      customerRating?: number;
      issuesEncountered?: string[];
    }
  ) {
    // Calculate prediction accuracy
    const [decision] = await db
      .select()
      .from(routingDecisions)
      .where(eq(routingDecisions.id, decisionId));

    if (!decision) return;

    const distanceAccuracy = 1 - Math.abs(decision.predictedDistance! - actuals.distance) / decision.predictedDistance!;
    const timeAccuracy = 1 - Math.abs(decision.predictedTime! - actuals.time) / decision.predictedTime!;
    const acceptanceAccuracy = decision.predictedAcceptanceProbability! === (actuals.wasAccepted ? 1 : 0) ? 1 : 0;
    
    const overallAccuracy = (distanceAccuracy + timeAccuracy + acceptanceAccuracy) / 3;

    await db.update(routingDecisions)
      .set({
        actualDistance: actuals.distance,
        actualTime: actuals.time,
        wasAccepted: actuals.wasAccepted,
        actualCost: actuals.cost,
        wasSuccessful: actuals.wasSuccessful,
        customerRating: actuals.customerRating,
        issuesEncountered: actuals.issuesEncountered as any,
        predictionAccuracy: overallAccuracy,
        completedAt: new Date()
      })
      .where(eq(routingDecisions.id, decisionId));

    // Update node performance based on this result
    await this.updateNodePerformance(decision.pickedNodeId, actuals);
  }

  /**
   * Update node performance metrics based on routing result
   */
  private async updateNodePerformance(
    nodeId: number,
    actuals: {
      wasAccepted: boolean;
      wasSuccessful: boolean;
      time: number;
      customerRating?: number;
    }
  ) {
    const [node] = await db.select().from(graphNodes).where(eq(graphNodes.id, nodeId));
    if (!node) return;

    // Calculate new success rate (exponential moving average)
    const alpha = 0.1; // Learning rate
    const currentSuccessRate = node.successRate || 0.8;
    const newSuccessRate = currentSuccessRate * (1 - alpha) + (actuals.wasSuccessful ? 1 : 0) * alpha;
    
    // Update average wait time
    const currentWaitTime = node.averageWaitTime || 0;
    const newWaitTime = currentWaitTime * (1 - alpha) + actuals.time * alpha;

    // Update customer satisfaction
    const currentSatisfaction = node.customerSatisfactionScore || 4.0;
    let newSatisfaction = currentSatisfaction;
    if (actuals.customerRating) {
      newSatisfaction = currentSatisfaction * (1 - alpha) + actuals.customerRating * alpha;
    }

    await db.update(graphNodes)
      .set({
        successRate: newSuccessRate,
        averageWaitTime: Math.round(newWaitTime),
        customerSatisfactionScore: newSatisfaction,
        updatedAt: new Date()
      })
      .where(eq(graphNodes.id, nodeId));
  }
}

// Export singleton instance
export const returnGraphService = new ReturnGraphService();
