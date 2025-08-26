import fs from 'fs/promises';
import path from 'path';

// OpenAI GPT-3.5-turbo pricing (cheapest model)
const OPENAI_PRICING = {
  'gpt-3.5-turbo': {
    input: 0.0005 / 1000,  // $0.50 per 1M tokens = $0.0005 per 1K tokens
    output: 0.0015 / 1000  // $1.50 per 1M tokens = $0.0015 per 1K tokens
  },
  'gpt-4o': {
    input: 0.005 / 1000,   // $5.00 per 1M tokens
    output: 0.015 / 1000   // $15.00 per 1M tokens
  }
};

// Replit pricing estimates (based on typical usage)
const REPLIT_COSTS = {
  core_monthly: 20,      // $20/month for Core plan
  cycles_per_dollar: 100, // Approximate cycles to dollar conversion
  storage_gb_monthly: 0.20, // $0.20 per GB/month
  compute_hour: 0.01     // Estimate for compute costs
};

interface CostEntry {
  id: string;
  timestamp: string;
  service: string;
  operation: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  costUsd: number;
  requestId?: string;
  userId?: number;
  endpoint?: string;
  duration?: number;
  status: string;
  metadata?: any;
}

interface DailySummary {
  date: string;
  service: string;
  totalRequests: number;
  totalTokens: number;
  totalCostUsd: number;
  avgCostPerRequest: number;
}

class CostTracker {
  private static costLog: CostEntry[] = [];
  private static logFile = path.join(process.cwd(), 'cost_tracking.json');

  // Track OpenAI API usage and costs
  static async trackOpenAI(
    model: string,
    inputTokens: number,
    outputTokens: number,
    endpoint: string,
    userId?: number,
    requestId?: string,
    duration?: number,
    status: string = 'success',
    metadata?: any
  ): Promise<void> {
    const pricing = OPENAI_PRICING[model as keyof typeof OPENAI_PRICING];
    if (!pricing) {
      console.warn(`Unknown OpenAI model pricing: ${model}`);
      return;
    }

    const inputCost = inputTokens * pricing.input;
    const outputCost = outputTokens * pricing.output;
    const totalCost = inputCost + outputCost;

    const entry: CostEntry = {
      id: `openai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      service: 'openai',
      operation: 'chat.completion',
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      costUsd: totalCost,
      requestId,
      userId,
      endpoint,
      duration,
      status,
      metadata
    };

    await this.logEntry(entry);
    
    console.log(`💰 OpenAI Cost: $${totalCost.toFixed(4)} (${inputTokens}+${outputTokens} tokens, ${model})`);
  }

  // Track Replit resource usage
  static async trackReplit(
    operation: string,
    resourceType: string,
    amount: number,
    costUsd: number,
    metadata?: any
  ): Promise<void> {
    const entry: CostEntry = {
      id: `replit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      service: 'replit',
      operation,
      costUsd,
      status: 'success',
      metadata: {
        resourceType,
        amount,
        ...metadata
      }
    };

    await this.logEntry(entry);
    
    console.log(`🖥️ Replit Cost: $${costUsd.toFixed(4)} (${operation}: ${amount} ${resourceType})`);
  }

  // Track other service costs (Stripe, etc.)
  static async trackService(
    service: string,
    operation: string,
    costUsd: number,
    metadata?: any
  ): Promise<void> {
    const entry: CostEntry = {
      id: `${service}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      service,
      operation,
      costUsd,
      status: 'success',
      metadata
    };

    await this.logEntry(entry);
    
    console.log(`💳 ${service.toUpperCase()} Cost: $${costUsd.toFixed(4)} (${operation})`);
  }

  // Log entry to file and memory
  private static async logEntry(entry: CostEntry): Promise<void> {
    this.costLog.push(entry);
    
    // Keep only last 1000 entries in memory
    if (this.costLog.length > 1000) {
      this.costLog = this.costLog.slice(-1000);
    }

    // Append to file for persistence
    try {
      const existingData = await this.readLogFile();
      existingData.push(entry);
      
      // Keep only last 10000 entries in file
      const trimmedData = existingData.slice(-10000);
      
      await fs.writeFile(this.logFile, JSON.stringify(trimmedData, null, 2));
    } catch (error) {
      console.error('Failed to write cost log:', error);
    }
  }

  // Read cost log from file
  private static async readLogFile(): Promise<CostEntry[]> {
    try {
      const data = await fs.readFile(this.logFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  // Get cost summary for a date range
  static async getCostSummary(
    startDate?: string,
    endDate?: string,
    service?: string
  ): Promise<{
    totalCost: number;
    requestCount: number;
    breakdown: Record<string, { cost: number; requests: number }>;
    dailySummary: DailySummary[];
  }> {
    const allEntries = await this.readLogFile();
    
    let filteredEntries = allEntries;
    
    if (startDate) {
      filteredEntries = filteredEntries.filter(e => e.timestamp >= startDate);
    }
    
    if (endDate) {
      filteredEntries = filteredEntries.filter(e => e.timestamp <= endDate);
    }
    
    if (service) {
      filteredEntries = filteredEntries.filter(e => e.service === service);
    }

    const totalCost = filteredEntries.reduce((sum, entry) => sum + entry.costUsd, 0);
    const requestCount = filteredEntries.length;

    // Service breakdown
    const breakdown: Record<string, { cost: number; requests: number }> = {};
    filteredEntries.forEach(entry => {
      if (!breakdown[entry.service]) {
        breakdown[entry.service] = { cost: 0, requests: 0 };
      }
      breakdown[entry.service].cost += entry.costUsd;
      breakdown[entry.service].requests += 1;
    });

    // Daily summary
    const dailyData: Record<string, Record<string, { cost: number; requests: number; tokens: number }>> = {};
    
    filteredEntries.forEach(entry => {
      const date = entry.timestamp.split('T')[0];
      if (!dailyData[date]) dailyData[date] = {};
      if (!dailyData[date][entry.service]) {
        dailyData[date][entry.service] = { cost: 0, requests: 0, tokens: 0 };
      }
      
      dailyData[date][entry.service].cost += entry.costUsd;
      dailyData[date][entry.service].requests += 1;
      dailyData[date][entry.service].tokens += entry.totalTokens || 0;
    });

    const dailySummary: DailySummary[] = [];
    Object.keys(dailyData).forEach(date => {
      Object.keys(dailyData[date]).forEach(service => {
        const data = dailyData[date][service];
        dailySummary.push({
          date,
          service,
          totalRequests: data.requests,
          totalTokens: data.tokens,
          totalCostUsd: data.cost,
          avgCostPerRequest: data.cost / data.requests
        });
      });
    });

    return {
      totalCost,
      requestCount,
      breakdown,
      dailySummary: dailySummary.sort((a, b) => b.date.localeCompare(a.date))
    };
  }

  // Get current month costs
  static async getCurrentMonthCosts(): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    
    return this.getCostSummary(startOfMonth, endOfMonth);
  }

  // Get today's costs
  static async getTodayCosts(): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = `${today}T00:00:00.000Z`;
    const endOfDay = `${today}T23:59:59.999Z`;
    
    return this.getCostSummary(startOfDay, endOfDay);
  }

  // Calculate estimated monthly costs
  static async getEstimatedMonthlyCosts(): Promise<{
    currentMonth: number;
    dailyAverage: number;
    projectedMonth: number;
    replitBase: number;
    totalProjected: number;
  }> {
    const monthlyData = await this.getCurrentMonthCosts();
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    
    const dailyAverage = monthlyData.totalCost / dayOfMonth;
    const projectedApiCosts = dailyAverage * daysInMonth;
    const replitBaseCost = REPLIT_COSTS.core_monthly; // Core plan base cost
    
    return {
      currentMonth: monthlyData.totalCost,
      dailyAverage,
      projectedMonth: projectedApiCosts,
      replitBase: replitBaseCost,
      totalProjected: projectedApiCosts + replitBaseCost
    };
  }

  // Clear old logs (older than specified days)
  static async clearOldLogs(daysToKeep: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffISO = cutoffDate.toISOString();
    
    try {
      const allEntries = await this.readLogFile();
      const recentEntries = allEntries.filter(entry => entry.timestamp >= cutoffISO);
      
      await fs.writeFile(this.logFile, JSON.stringify(recentEntries, null, 2));
      console.log(`Cleared logs older than ${daysToKeep} days. Kept ${recentEntries.length} entries.`);
    } catch (error) {
      console.error('Failed to clear old logs:', error);
    }
  }
}

export default CostTracker;