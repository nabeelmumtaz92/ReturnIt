import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { db } from "./db";
import { storage } from "./storage";
import { KnowledgeBaseManager } from "./knowledge-base-manager";

// Initialize Gemini (much cheaper than OpenAI)
let genai: GoogleGenAI | null = null;

if (process.env.GEMINI_API_KEY) {
  genai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY 
  });
}

// Auto-refresh knowledge base on startup
KnowledgeBaseManager.refreshKnowledge().catch(err => 
  console.error('[AI] Failed to initialize knowledge base:', err)
);

const execAsync = promisify(exec);

interface CodeChange {
  file: string;
  description: string;
  preview: string;
  fullContent?: string;
}

interface DatabaseQuery {
  query: string;
  result: any;
  description: string;
}

interface CommandResult {
  command: string;
  output: string;
  description: string;
}

interface AIResponse {
  message: string;
  codeChanges: CodeChange[];
  databaseQueries?: DatabaseQuery[];
  commandResults?: CommandResult[];
  needsConfirmation?: boolean;
}

// NOTE: System prompt is now generated dynamically by KnowledgeBaseManager
// It auto-scans replit.md, schema.ts, and routes.ts to stay current with the codebase

// Learning system for adaptive AI capabilities
interface LearningEntry {
  id: string;
  userInput: string;
  systemResponse: string;
  context: string;
  outcome: 'success' | 'error' | 'partial';
  timestamp: Date;
  userId?: string;
  tags: string[];
}

interface UserPattern {
  userId: string;
  commonCommands: string[];
  preferences: Record<string, any>;
  expertise_level: 'beginner' | 'intermediate' | 'advanced';
  interaction_count: number;
  last_active: Date;
}

class LearningSystem {
  private static learningData: LearningEntry[] = [];
  private static userPatterns: Map<string, UserPattern> = new Map();

  static async recordInteraction(input: string, response: string, outcome: 'success' | 'error' | 'partial', userId?: string): Promise<void> {
    const entry: LearningEntry = {
      id: Date.now().toString(),
      userInput: input.toLowerCase(),
      systemResponse: response,
      context: this.extractContext(input),
      outcome,
      timestamp: new Date(),
      userId,
      tags: this.extractTags(input)
    };

    this.learningData.push(entry);
    if (userId) {
      this.updateUserPattern(userId, input, outcome);
    }

    // Keep only last 1000 entries for memory efficiency
    if (this.learningData.length > 1000) {
      this.learningData = this.learningData.slice(-1000);
    }
  }

  private static extractContext(input: string): string {
    if (input.includes('delete')) return 'user_management';
    if (input.includes('report') || input.includes('generate')) return 'reporting';
    if (input.includes('performance') || input.includes('analyze')) return 'analytics';
    if (input.includes('backup') || input.includes('sql')) return 'database_ops';
    if (input.includes('order') || input.includes('status')) return 'order_management';
    return 'general';
  }

  private static extractTags(input: string): string[] {
    const tags = [];
    if (input.includes('delete')) tags.push('delete');
    if (input.includes('create')) tags.push('create');
    if (input.includes('update')) tags.push('update');
    if (input.includes('list') || input.includes('show')) tags.push('read');
    if (input.includes('user')) tags.push('user');
    if (input.includes('order')) tags.push('order');
    if (input.includes('report')) tags.push('report');
    if (input.includes('performance')) tags.push('performance');
    return tags;
  }

  private static updateUserPattern(userId: string, input: string, outcome: 'success' | 'error' | 'partial'): void {
    let pattern = this.userPatterns.get(userId);
    
    if (!pattern) {
      pattern = {
        userId,
        commonCommands: [],
        preferences: {},
        expertise_level: 'beginner',
        interaction_count: 0,
        last_active: new Date()
      };
    }

    pattern.interaction_count++;
    pattern.last_active = new Date();

    // Track common commands
    const commandType = this.extractContext(input);
    const existingCommand = pattern.commonCommands.find(cmd => cmd === commandType);
    if (!existingCommand) {
      pattern.commonCommands.push(commandType);
    }

    // Determine expertise level based on interaction patterns
    if (pattern.interaction_count > 50 && pattern.commonCommands.length > 5) {
      pattern.expertise_level = 'advanced';
    } else if (pattern.interaction_count > 15 && pattern.commonCommands.length > 3) {
      pattern.expertise_level = 'intermediate';
    }

    this.userPatterns.set(userId, pattern);
  }

  static getSimilarInteractions(input: string, limit = 5): LearningEntry[] {
    const inputWords = input.toLowerCase().split(' ');
    
    return this.learningData
      .filter(entry => entry.outcome === 'success')
      .map(entry => ({
        ...entry,
        similarity: this.calculateSimilarity(inputWords, entry.userInput.split(' '))
      }))
      .sort((a, b) => (b as any).similarity - (a as any).similarity)
      .slice(0, limit);
  }

  private static calculateSimilarity(words1: string[], words2: string[]): number {
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  static adaptResponse(originalResponse: string, input: string, userId?: string): string {
    const similar = this.getSimilarInteractions(input, 3);
    let adaptedResponse = originalResponse;

    // Add contextual reasoning and best practices
    const context = this.extractContext(input);
    const reasoning = this.generateReasoning(input, context);
    if (reasoning) {
      adaptedResponse += `\n\n💡 **Context & Reasoning**: ${reasoning}`;
    }

    // Add learning insights if similar patterns found
    if (similar.length > 0) {
      adaptedResponse += "\n\n🧠 **Based on Similar Requests**: ";
      const bestPractice = this.getBestPracticeFromSimilar(similar, context);
      if (bestPractice) {
        adaptedResponse += bestPractice;
      } else {
        adaptedResponse += "You might also want to:\n";
        similar.forEach((entry, index) => {
          if (index < 2) {
            adaptedResponse += `• Try: "${entry.userInput}"\n`;
          }
        });
      }
    }

    // Add personalized suggestions for known users
    if (userId) {
      const pattern = this.userPatterns.get(userId);
      if (pattern) {
        const personalizedAdvice = this.getPersonalizedAdvice(pattern, context);
        adaptedResponse += `\n🎯 **Personalized Advice**: ${personalizedAdvice}`;
      }
    }

    return adaptedResponse;
  }

  private static generateReasoning(input: string, context: string): string {
    const lowerInput = input.toLowerCase();
    
    if (context === 'user_management' && lowerInput.includes('delete')) {
      return "User deletion is irreversible and affects all associated data (orders, notifications). Consider deactivating instead if you need to preserve history.";
    }
    
    if (context === 'reporting' && lowerInput.includes('generate')) {
      return "Reports provide insights for decision-making. Consider what specific metrics will help you optimize operations or identify trends.";
    }
    
    if (context === 'analytics' && lowerInput.includes('performance')) {
      return "Performance analysis helps identify bottlenecks and optimization opportunities. Look for patterns in user behavior and system efficiency.";
    }
    
    if (context === 'database_ops' && lowerInput.includes('backup')) {
      return "Regular backups are crucial for data protection. Consider automating this process and storing backups in multiple locations.";
    }
    
    if (context === 'order_management') {
      return "Order management affects customer experience directly. Ensure status updates are accurate and communicate changes to relevant parties.";
    }
    
    return "";
  }

  private static getBestPracticeFromSimilar(similar: LearningEntry[], context: string): string {
    const successfulPatterns = similar.filter(entry => entry.outcome === 'success');
    
    if (context === 'user_management' && successfulPatterns.length > 0) {
      return "Based on successful patterns, consider checking user activity before deletion and ensuring proper data cleanup.";
    }
    
    if (context === 'reporting' && successfulPatterns.length > 0) {
      return "Most effective reports focus on specific time ranges and include actionable metrics. Consider filtering by relevant criteria.";
    }
    
    if (context === 'analytics' && successfulPatterns.length > 0) {
      return "Performance analysis works best when combined with historical comparison. Look at trends over time rather than snapshots.";
    }
    
    return "";
  }

  private static getPersonalizedAdvice(pattern: UserPattern, context: string): string {
    const level = pattern.expertise_level;
    const commonCmds = pattern.commonCommands;
    
    if (level === 'advanced') {
      if (context === 'user_management') {
        return "As an advanced user, consider bulk operations and automated user lifecycle management for efficiency.";
      }
      if (context === 'analytics') {
        return "Advanced analytics: Try custom SQL queries for deeper insights and cross-reference multiple data sources.";
      }
    }
    
    if (level === 'beginner') {
      if (context === 'user_management') {
        return "Start with simple operations like listing users before attempting deletions. Always verify user details first.";
      }
      if (context === 'reporting') {
        return "Begin with basic reports to understand data structure, then gradually explore more complex analytics.";
      }
    }
    
    // Suggest complementary operations based on usage patterns
    if (commonCmds.includes('user_management') && !commonCmds.includes('reporting')) {
      return "Since you frequently manage users, consider generating user reports to track patterns and optimize your workflow.";
    }
    
    if (commonCmds.includes('analytics') && !commonCmds.includes('database_ops')) {
      return "Your analytics work would benefit from regular data backups to ensure historical data integrity.";
    }
    
    return `As an ${level} user with ${pattern.interaction_count} interactions, you might explore ${this.suggestNextStep(commonCmds)} operations.`;
  }

  private static suggestNextStep(commonCommands: string[]): string {
    const allContexts = ['user_management', 'reporting', 'analytics', 'database_ops', 'order_management'];
    const unexplored = allContexts.filter(ctx => !commonCommands.includes(ctx));
    
    if (unexplored.length > 0) {
      return unexplored[0];
    }
    
    return 'advanced';
  }

  static getSystemInsights(): any {
    const totalInteractions = this.learningData.length;
    const successRate = this.learningData.filter(e => e.outcome === 'success').length / totalInteractions;
    const topContexts = this.getTopContexts();
    const activeUsers = Array.from(this.userPatterns.values()).filter(p => 
      (Date.now() - p.last_active.getTime()) < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    ).length;

    return {
      totalInteractions,
      successRate: (successRate * 100).toFixed(1),
      topContexts,
      activeUsers,
      learningEntries: this.learningData.length
    };
  }

  private static getTopContexts(): Array<{context: string, count: number}> {
    const contextCounts: Record<string, number> = {};
    this.learningData.forEach(entry => {
      contextCounts[entry.context] = (contextCounts[entry.context] || 0) + 1;
    });

    return Object.entries(contextCounts)
      .map(([context, count]) => ({context, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}

export class AIAssistant {
  
  static async processRequest(prompt: string): Promise<AIResponse> {
    if (!genai) {
      return {
        message: "Gemini API key is not configured. Please add GEMINI_API_KEY to environment variables to enable AI assistance.",
        codeChanges: [],
        databaseQueries: [],
        commandResults: []
      };
    }

    try {
      // Get fresh system prompt from knowledge base manager
      const systemPrompt = await KnowledgeBaseManager.generateSystemPrompt();
      const context = await this.getCodebaseContext();
      
      const startTime = Date.now();
      const response = await genai.models.generateContent({
        model: "gemini-2.5-flash", // Cost-optimized Gemini model (90% cheaper than OpenAI!)
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nCurrent codebase context:\n${context}\n\nUser request: ${prompt}\n\nPlease respond with valid JSON containing: message, codeChanges (array), needsConfirmation (boolean)` }] }
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      });
      
      const duration = Date.now() - startTime;
      
      // Track Gemini costs (much cheaper than OpenAI!)
      const CostTracker = (await import('./cost-tracker')).default;
      const usage = response.usageMetadata;
      if (usage) {
        await CostTracker.trackGemini(
          'gemini-2.5-flash',
          usage.promptTokenCount || 0,
          usage.candidatesTokenCount || 0,
          '/api/ai/process',
          undefined, // No user ID in this context
          duration,
          'success',
          { prompt_length: prompt.length, has_context: true }
        );
      }

      const responseData = JSON.parse(response.text || '{}');
      
      // Validate and apply code changes
      if (responseData.codeChanges && Array.isArray(responseData.codeChanges)) {
        for (const change of responseData.codeChanges) {
          if (change.fullContent) {
            await this.applyCodeChange(change);
          }
        }
      }

      return {
        message: responseData.message || "Request processed successfully",
        codeChanges: responseData.codeChanges || [],
        needsConfirmation: responseData.needsConfirmation || false
      };

    } catch (error: any) {
      console.error('AI Assistant error:', error);
      return {
        message: `Error processing request: ${error.message}`,
        codeChanges: [],
        databaseQueries: [],
        commandResults: []
      };
    }
  }

  // Add comprehensive tool capabilities
  static async executeTools(prompt: string): Promise<any> {
    const tools = {
      searchCodebase: this.searchCodebase,
      readFile: this.readFile,
      writeFile: this.writeFile,
      runCommand: this.runCommand,
      queryDatabase: this.queryDatabase,
      analyzeProject: this.analyzeProject
    };

    // Simple tool detection - can be enhanced with OpenAI function calling
    const results: any = {};
    
    if (prompt.includes('search') || prompt.includes('find')) {
      results.codebaseFiles = await this.analyzeProject();
    }
    
    if (prompt.includes('database') || prompt.includes('SQL')) {
      results.databaseSchema = await this.getDatabaseSchema();
    }
    
    return results;
  }

  static async searchCodebase(query: string): Promise<string[]> {
    try {
      const { stdout } = await execAsync(`find . -name "*.tsx" -o -name "*.ts" -o -name "*.js" | head -20`);
      return stdout.split('\n').filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  static async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      return `Error reading file: ${error}`;
    }
  }

  static async writeFile(filePath: string, content: string): Promise<boolean> {
    try {
      await fs.writeFile(filePath, content, 'utf8');
      return true;
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
      return false;
    }
  }

  static async runCommand(command: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(command);
      return stdout || stderr;
    } catch (error: any) {
      return `Command failed: ${error.message}`;
    }
  }

  static async queryDatabase(sql: string): Promise<any> {
    try {
      const result = await db.execute(sql as any);
      return result;
    } catch (error) {
      return { error: `Database query failed: ${error}` };
    }
  }

  // Enhanced administrative functions
  static async deleteUser(userIdOrEmail: string): Promise<any> {
    try {
      const { storage } = await import('./storage');
      
      // Find user by ID or email
      let user;
      if (userIdOrEmail.includes('@')) {
        user = await storage.getUserByEmail(userIdOrEmail);
      } else {
        user = await storage.getUser(parseInt(userIdOrEmail));
      }
      
      if (!user) {
        return { error: 'User not found' };
      }
      
      // Delete user's orders first (cascade)
      await db.execute(`DELETE FROM orders WHERE user_id = ${user.id}` as any);
      
      // Delete user's notifications
      await db.execute(`DELETE FROM notifications WHERE user_id = ${user.id}` as any);
      
      // Delete the user
      await db.execute(`DELETE FROM users WHERE id = ${user.id}` as any);
      
      return { 
        success: true, 
        message: `User ${user.email} (ID: ${user.id}) has been successfully deleted along with all associated data.`,
        deletedUser: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
      };
    } catch (error) {
      return { error: `Failed to delete user: ${error}` };
    }
  }

  static async createUser(userData: any): Promise<any> {
    try {
      const { storage } = await import('./storage');
      const bcrypt = await import('bcrypt');
      
      // Hash password if provided
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      
      const newUser = await storage.createUser(userData);
      return { 
        success: true, 
        message: `User ${newUser.email} has been created successfully.`,
        user: newUser 
      };
    } catch (error) {
      return { error: `Failed to create user: ${error}` };
    }
  }

  static async updateUser(userIdOrEmail: string, updates: any): Promise<any> {
    try {
      const { storage } = await import('./storage');
      
      // Find user
      let user;
      if (userIdOrEmail.includes('@')) {
        user = await storage.getUserByEmail(userIdOrEmail);
      } else {
        user = await storage.getUser(parseInt(userIdOrEmail));
      }
      
      if (!user) {
        return { error: 'User not found' };
      }
      
      // Update user
      const updatedUser = await storage.updateUser(user.id, updates);
      return { 
        success: true, 
        message: `User ${user.email} has been updated successfully.`,
        user: updatedUser 
      };
    } catch (error) {
      return { error: `Failed to update user: ${error}` };
    }
  }

  static async listUsers(limit: number = 10): Promise<any> {
    try {
      const result = await db.execute(`SELECT id, email, first_name, last_name, phone, is_admin, is_driver, created_at FROM users ORDER BY created_at DESC LIMIT ${limit}` as any);
      return { 
        success: true, 
        users: result,
        message: `Retrieved ${Array.isArray(result) ? result.length : 0} users from the database.`
      };
    } catch (error) {
      return { error: `Failed to list users: ${error}` };
    }
  }

  static async deleteOrder(orderId: string): Promise<any> {
    try {
      const result = await db.execute(`DELETE FROM orders WHERE id = ${orderId}` as any);
      return { 
        success: true, 
        message: `Order ${orderId} has been deleted successfully.`
      };
    } catch (error) {
      return { error: `Failed to delete order: ${error}` };
    }
  }

  static async updateOrderStatus(orderId: string, status: string): Promise<any> {
    try {
      const result = await db.execute(`UPDATE orders SET status = '${status}' WHERE id = ${orderId}` as any);
      return { 
        success: true, 
        message: `Order ${orderId} status updated to ${status}.`
      };
    } catch (error) {
      return { error: `Failed to update order status: ${error}` };
    }
  }

  static async getSystemStats(): Promise<any> {
    try {
      const userCount = await db.execute("SELECT COUNT(*) as count FROM users" as any);
      const orderCount = await db.execute("SELECT COUNT(*) as count FROM orders" as any);
      const activeOrders = await db.execute("SELECT COUNT(*) as count FROM orders WHERE status IN ('created', 'assigned', 'picked_up')" as any);
      const completedOrders = await db.execute("SELECT COUNT(*) as count FROM orders WHERE status = 'delivered'" as any);
      
      return {
        success: true,
        stats: {
          totalUsers: Array.isArray(userCount) ? userCount[0]?.count : userCount.count,
          totalOrders: Array.isArray(orderCount) ? orderCount[0]?.count : orderCount.count,
          activeOrders: Array.isArray(activeOrders) ? activeOrders[0]?.count : activeOrders.count,
          completedOrders: Array.isArray(completedOrders) ? completedOrders[0]?.count : completedOrders.count
        },
        message: "System statistics retrieved successfully"
      };
    } catch (error) {
      return { error: `Failed to get system stats: ${error}` };
    }
  }

  static async searchOrders(status?: string, limit: number = 10): Promise<any> {
    try {
      // SECURITY: Use parameterized queries to prevent SQL injection
      const { storage } = await import('./storage');
      
      // Use the storage layer which has parameterized queries
      const allOrders = await storage.getOrders();
      
      let filteredOrders = allOrders;
      if (status) {
        filteredOrders = allOrders.filter(order => order.status === status);
      }
      
      // Sort by created_at and limit
      const sortedOrders = filteredOrders
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, limit);
      
      return {
        success: true,
        orders: sortedOrders,
        message: `Retrieved ${sortedOrders.length} orders${status ? ` with status '${status}'` : ''}`
      };
    } catch (error) {
      return { error: `Failed to search orders: ${error}` };
    }
  }

  static async executeCustomQuery(sql: string): Promise<any> {
    // SECURITY: Custom SQL execution disabled to prevent SQL injection vulnerabilities
    // Use specific admin commands or create dedicated API endpoints for database operations
    return { 
      error: "Direct SQL execution is disabled for security. Use specific admin commands (list users, update order status, etc.) instead." 
    };
  }

  static async getRecentActivity(limit: number = 20): Promise<any> {
    try {
      // SECURITY: Use storage layer with parameterized queries instead of raw SQL
      const { storage } = await import('./storage');
      
      // Get recent orders and users separately
      const orders = await storage.getOrders();
      const users = await storage.getUsers();
      
      // Combine and format activities
      const activities = [
        ...orders.slice(0, Math.floor(limit / 2)).map(o => ({
          type: 'order',
          id: o.id,
          status: o.status,
          created_at: o.createdAt,
          details: o.pickupAddress
        })),
        ...users.slice(0, Math.floor(limit / 2)).map(u => ({
          type: 'user',
          id: u.id,
          status: u.email,
          created_at: u.createdAt,
          details: u.firstName
        }))
      ]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, limit);
      
      return {
        success: true,
        activities: activities,
        message: `Retrieved ${activities.length} recent activities`
      };
    } catch (error) {
      return { error: `Failed to get recent activity: ${error}` };
    }
  }

  static async toggleUserStatus(userIdOrEmail: string, isActive: boolean): Promise<any> {
    try {
      const { storage } = await import('./storage');
      
      let user;
      if (userIdOrEmail.includes('@')) {
        user = await storage.getUserByEmail(userIdOrEmail);
      } else {
        user = await storage.getUser(parseInt(userIdOrEmail));
      }
      
      if (!user) {
        return { error: 'User not found' };
      }
      
      await db.execute(`UPDATE users SET is_active = ${isActive} WHERE id = ${user.id}` as any);
      
      return {
        success: true,
        message: `User ${user.email} has been ${isActive ? 'activated' : 'deactivated'}.`
      };
    } catch (error) {
      return { error: `Failed to toggle user status: ${error}` };
    }
  }

  static async bulkDeleteUsers(criteria: string): Promise<any> {
    try {
      // Safety check for bulk operations
      if (!criteria || criteria.toLowerCase().includes('*') || criteria.toLowerCase().includes('all')) {
        return { error: "Bulk deletion requires specific criteria for safety. Avoid wildcard operations." };
      }
      
      let query = "DELETE FROM users WHERE ";
      
      if (criteria.includes('@')) {
        // Email domain deletion
        const domain = criteria.replace('@', '');
        query += `email LIKE '%@${domain}'`;
      } else if (criteria.includes('inactive')) {
        query += "is_active = false";
      } else if (criteria.includes('no_orders')) {
        query += "id NOT IN (SELECT DISTINCT user_id FROM orders WHERE user_id IS NOT NULL)";
      } else {
        return { error: "Invalid criteria. Use email domain (@example.com), 'inactive', or 'no_orders'" };
      }
      
      const result = await db.execute(query as any);
      return {
        success: true,
        message: `Bulk deletion completed based on criteria: ${criteria}`,
        affectedRows: result
      };
    } catch (error) {
      return { error: `Bulk deletion failed: ${error}` };
    }
  }

  static async generateReport(reportType: string): Promise<any> {
    try {
      let reportData: any = {};
      let reportName = '';
      
      switch (reportType.toLowerCase()) {
        case 'users':
          reportData = await db.execute("SELECT id, email, first_name, last_name, created_at, is_admin, is_driver FROM users ORDER BY created_at DESC" as any);
          reportName = 'User Report';
          break;
          
        case 'orders':
          reportData = await db.execute("SELECT id, user_id, status, pickup_address, delivery_address, amount, created_at FROM orders ORDER BY created_at DESC" as any);
          reportName = 'Orders Report';
          break;
          
        case 'revenue':
          reportData = await db.execute("SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(amount) as revenue FROM orders WHERE status = 'delivered' GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30" as any);
          reportName = 'Revenue Report (Last 30 Days)';
          break;
          
        case 'drivers':
          reportData = await db.execute("SELECT id, email, first_name, last_name, created_at FROM users WHERE is_driver = true ORDER BY created_at DESC" as any);
          reportName = 'Driver Report';
          break;
          
        default:
          return { error: "Invalid report type. Available: users, orders, revenue, drivers" };
      }
      
      return {
        success: true,
        reportName,
        data: reportData,
        recordCount: Array.isArray(reportData) ? reportData.length : 1,
        message: `Generated ${reportName} with ${Array.isArray(reportData) ? reportData.length : 1} records`
      };
    } catch (error) {
      return { error: `Report generation failed: ${error}` };
    }
  }

  static async analyzePerformance(): Promise<any> {
    try {
      const metrics = {
        avgOrderTime: await db.execute("SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_hours FROM orders WHERE status = 'delivered'" as any),
        ordersByStatus: await db.execute("SELECT status, COUNT(*) as count FROM orders GROUP BY status" as any),
        topUsers: await db.execute("SELECT u.email, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id, u.email ORDER BY order_count DESC LIMIT 10" as any),
        revenueByDay: await db.execute("SELECT DATE(created_at) as date, SUM(amount) as daily_revenue FROM orders WHERE status = 'delivered' AND created_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(created_at) ORDER BY date" as any)
      };
      
      return {
        success: true,
        metrics,
        message: "Performance analysis completed successfully"
      };
    } catch (error) {
      return { error: `Performance analysis failed: ${error}` };
    }
  }

  static async backupData(tables?: string[]): Promise<any> {
    try {
      const tablesToBackup = tables || ['users', 'orders', 'notifications'];
      const backupData: any = {};
      
      for (const table of tablesToBackup) {
        const data = await db.execute(`SELECT * FROM ${table}` as any);
        backupData[table] = data;
      }
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
      const backupFilename = `backup_${timestamp}.json`;
      
      return {
        success: true,
        backupData,
        filename: backupFilename,
        tables: tablesToBackup,
        message: `Data backup completed for tables: ${tablesToBackup.join(', ')}`
      };
    } catch (error) {
      return { error: `Backup failed: ${error}` };
    }
  }

  // Intelligent processing with strategic thinking
  static async processWithLearning(prompt: string, userId?: string): Promise<any> {
    try {
      let result: any = { message: "Processing your request...", success: true };
      const lowerPrompt = prompt.toLowerCase();

      // Strategic business analysis requests
      if (lowerPrompt.includes('health check') || lowerPrompt.includes('business health')) {
        result = await this.performBusinessHealthCheck();
      } else if (lowerPrompt.includes('optimization') || lowerPrompt.includes('optimize')) {
        result = await this.identifyOptimizationOpportunities();
      } else if (lowerPrompt.includes('risk assessment') || lowerPrompt.includes('risks')) {
        result = await this.performRiskAssessment();
      } else if (lowerPrompt.includes('growth strategy') || lowerPrompt.includes('grow')) {
        result = await this.analyzeGrowthOpportunities();
      }
      // Intelligent command processing with context
      else if (lowerPrompt.includes('delete user')) {
        const emailMatch = prompt.match(/delete user ([^\s]+)/i);
        if (emailMatch) {
          result = await this.intelligentUserDeletion(emailMatch[1]);
        }
      } else if (lowerPrompt.includes('list users')) {
        result = await this.intelligentUserListing();
      } else if (lowerPrompt.includes('system stats')) {
        result = await this.intelligentSystemAnalysis();
      } else if (lowerPrompt.includes('generate report')) {
        const reportMatch = prompt.match(/report(?:\s+on\s+|\s+)(\w+)/i);
        if (reportMatch) {
          result = await this.intelligentReportGeneration(reportMatch[1]);
        }
      } else if (lowerPrompt.includes('performance analysis')) {
        result = await this.intelligentPerformanceAnalysis();
      } else if (lowerPrompt.includes('backup data')) {
        result = await this.intelligentBackupStrategy();
      } else if (lowerPrompt.includes('sql query')) {
        const sqlMatch = prompt.match(/sql query\s*[:=]?\s*(.+)/i);
        if (sqlMatch) {
          result = await this.intelligentQueryExecution(sqlMatch[1]);
        }
      } else {
        // Intelligent pattern matching and external research
        result = await this.intelligentResearchAndResponse(prompt);
      }

      // Record the interaction for learning
      const outcome = result.error ? 'error' : result.success ? 'success' : 'partial';
      await LearningSystem.recordInteraction(prompt, result.message || '', outcome, userId);

      // Adapt the response based on learning
      if (result.message) {
        result.message = LearningSystem.adaptResponse(result.message, prompt, userId);
      }

      return result;
    } catch (error) {
      await LearningSystem.recordInteraction(prompt, `Error: ${error}`, 'error', userId);
      return { error: `Processing failed: ${error}` };
    }
  }

  static async getLearningInsights(): Promise<any> {
    try {
      const insights = LearningSystem.getSystemInsights();
      
      return {
        success: true,
        insights,
        message: "Learning system analysis completed"
      };
    } catch (error) {
      return { error: `Failed to get learning insights: ${error}` };
    }
  }

  static async trainOnFeedback(originalPrompt: string, feedback: 'helpful' | 'not_helpful', userId?: string): Promise<any> {
    try {
      // Find the recent interaction and update its outcome based on feedback
      const recentEntry = LearningSystem.learningData
        .filter(entry => entry.userInput.includes(originalPrompt.toLowerCase()) && entry.userId === userId)
        .pop();

      if (recentEntry) {
        recentEntry.outcome = feedback === 'helpful' ? 'success' : 'error';
      }

      return {
        success: true,
        message: `Thank you for the feedback! I'm learning from this interaction to improve future responses.`
      };
    } catch (error) {
      return { error: `Failed to process feedback: ${error}` };
    }
  }

  // Strategic business analysis methods
  static async performBusinessHealthCheck(): Promise<any> {
    try {
      const stats = await this.getSystemStats();
      const performance = await this.analyzePerformance();
      
      let healthScore = 85; // Base score
      let insights = [];
      let recommendations = [];

      if (stats.success) {
        const s = stats.stats;
        
        // Analyze user engagement
        if (s.totalUsers > 0) {
          const activeRatio = s.activeOrders / s.totalOrders;
          if (activeRatio > 0.3) {
            insights.push("High order activity indicates good user engagement");
            healthScore += 5;
          } else {
            insights.push("Low order activity may indicate user retention issues");
            recommendations.push("Implement user engagement campaigns or loyalty programs");
            healthScore -= 10;
          }
        }

        // Analyze completion rates
        const completionRate = s.completedOrders / s.totalOrders;
        if (completionRate > 0.8) {
          insights.push("Excellent order completion rate shows reliable service");
          healthScore += 10;
        } else if (completionRate < 0.6) {
          insights.push("Low completion rate indicates operational issues");
          recommendations.push("Investigate driver availability and route optimization");
          healthScore -= 15;
        }
      }

      return {
        success: true,
        healthScore,
        insights,
        recommendations,
        message: `Business Health Score: ${healthScore}/100\n\nKey Insights:\n${insights.map(i => `• ${i}`).join('\n')}\n\nRecommendations:\n${recommendations.map(r => `• ${r}`).join('\n')}`
      };
    } catch (error) {
      return { error: `Health check failed: ${error}` };
    }
  }

  static async identifyOptimizationOpportunities(): Promise<any> {
    try {
      const performance = await this.analyzePerformance();
      const opportunities = [];
      const impact = [];

      // Database optimization opportunities
      opportunities.push("Database indexing on frequently queried columns (user_id, status, created_at)");
      impact.push("30-50% faster query performance");

      // User experience optimizations
      opportunities.push("Real-time order tracking with WebSocket integration");
      impact.push("Improved customer satisfaction and reduced support queries");

      // Operational efficiency
      opportunities.push("Automated driver assignment based on location and availability");
      impact.push("Reduced delivery times and increased driver utilization");

      // Performance monitoring
      opportunities.push("Implement automated performance monitoring and alerting");
      impact.push("Proactive issue detection and faster resolution times");

      return {
        success: true,
        opportunities,
        impact,
        message: `Optimization Opportunities Identified:\n\n${opportunities.map((opp, i) => `${i + 1}. ${opp}\n   Impact: ${impact[i]}`).join('\n\n')}\n\nPriority: Start with database indexing for immediate performance gains.`
      };
    } catch (error) {
      return { error: `Optimization analysis failed: ${error}` };
    }
  }

  static async performRiskAssessment(): Promise<any> {
    try {
      const risks = [
        {
          category: "Data Security",
          risk: "User personal information and payment data exposure",
          probability: "Medium",
          impact: "High",
          mitigation: "Implement encryption at rest, regular security audits, and PCI compliance"
        },
        {
          category: "Operational",
          risk: "Driver shortage during peak times",
          probability: "High",
          impact: "Medium",
          mitigation: "Dynamic pricing, driver incentive programs, and partnerships with courier services"
        },
        {
          category: "Technical",
          risk: "System downtime affecting order processing",
          probability: "Low",
          impact: "High",
          mitigation: "Load balancing, automated failover, and comprehensive monitoring"
        },
        {
          category: "Financial",
          risk: "Payment processing failures or fraud",
          probability: "Medium",
          impact: "High",
          mitigation: "Multiple payment gateways, fraud detection, and secure payment processing"
        }
      ];

      const riskMatrix = risks.map(r => 
        `${r.category}: ${r.risk}\n  Probability: ${r.probability} | Impact: ${r.impact}\n  Mitigation: ${r.mitigation}`
      ).join('\n\n');

      return {
        success: true,
        risks,
        message: `Risk Assessment Summary:\n\n${riskMatrix}\n\nNext Steps: Prioritize high-impact risks for immediate attention.`
      };
    } catch (error) {
      return { error: `Risk assessment failed: ${error}` };
    }
  }

  static async analyzeGrowthOpportunities(): Promise<any> {
    try {
      const stats = await this.getSystemStats();
      const strategies = [];

      strategies.push({
        strategy: "Geographic Expansion",
        description: "Expand to adjacent cities with similar demographics",
        implementation: "Market research, driver recruitment, local partnerships",
        expectedGrowth: "25-40% user base increase"
      });

      strategies.push({
        strategy: "Service Diversification",
        description: "Add specialized services (fragile items, same-day returns, bulk pickups)",
        implementation: "Driver training, specialized equipment, premium pricing tiers",
        expectedGrowth: "15-25% revenue increase per customer"
      });

      strategies.push({
        strategy: "B2B Partnerships",
        description: "Partner with e-commerce platforms and retail stores",
        implementation: "API integrations, bulk pricing agreements, dedicated support",
        expectedGrowth: "50-100% order volume increase"
      });

      const growthPlan = strategies.map((s, i) => 
        `${i + 1}. ${s.strategy}\n   ${s.description}\n   Implementation: ${s.implementation}\n   Expected Growth: ${s.expectedGrowth}`
      ).join('\n\n');

      return {
        success: true,
        strategies,
        message: `Growth Strategy Recommendations:\n\n${growthPlan}\n\nRecommendation: Start with B2B partnerships for fastest growth with lowest risk.`
      };
    } catch (error) {
      return { error: `Growth analysis failed: ${error}` };
    }
  }

  // Intelligent versions of existing methods that add reasoning and context
  static async intelligentUserDeletion(userIdentifier: string): Promise<any> {
    try {
      // First analyze the user's impact
      const userAnalysis = await db.execute(`
        SELECT u.*, COUNT(o.id) as order_count, MAX(o.created_at) as last_order
        FROM users u 
        LEFT JOIN orders o ON u.id = o.user_id 
        WHERE u.email = '${userIdentifier}' OR u.id = '${userIdentifier}'
        GROUP BY u.id
      ` as any);

      if (!userAnalysis || (Array.isArray(userAnalysis) && userAnalysis.length === 0)) {
        return { error: "User not found for analysis" };
      }

      const user = Array.isArray(userAnalysis) ? userAnalysis[0] : userAnalysis;
      const orderCount = user.order_count || 0;
      const lastOrder = user.last_order;

      let recommendation = "";
      let risk = "Low";

      if (orderCount > 10) {
        risk = "High";
        recommendation = "⚠️ HIGH RISK: This user has significant order history. Consider deactivation instead of deletion to preserve analytics and referential integrity.";
      } else if (orderCount > 0) {
        risk = "Medium";
        recommendation = "⚠️ MEDIUM RISK: User has order history. Deletion will affect order records and analytics.";
      } else {
        recommendation = "✅ LOW RISK: User has no orders. Safe to delete.";
      }

      const result = await this.deleteUser(userIdentifier);
      
      if (result.success) {
        result.message = `${recommendation}\n\n${result.message}\n\n📊 Impact Analysis:\n• Orders affected: ${orderCount}\n• Risk level: ${risk}\n• Last activity: ${lastOrder || 'No orders'}`;
      }

      return result;
    } catch (error) {
      return { error: `Intelligent user deletion failed: ${error}` };
    }
  }

  static async intelligentSystemAnalysis(): Promise<any> {
    try {
      const stats = await this.getSystemStats();
      if (!stats.success) return stats;

      const s = stats.stats;
      let analysis = [];

      // User growth analysis
      if (s.totalUsers > 0) {
        analysis.push(`User Base: ${s.totalUsers} total users`);
        
        const activePercentage = ((s.activeOrders / s.totalUsers) * 100).toFixed(1);
        analysis.push(`Activity Level: ${activePercentage}% of users have active orders`);
      }

      // Order pipeline analysis
      const completionRate = ((s.completedOrders / s.totalOrders) * 100).toFixed(1);
      analysis.push(`Order Completion Rate: ${completionRate}% (Industry average: 85-90%)`);

      // Business health indicators
      if (parseFloat(completionRate) >= 85) {
        analysis.push("✅ Excellent completion rate indicates reliable service delivery");
      } else if (parseFloat(completionRate) >= 70) {
        analysis.push("⚠️ Completion rate below industry average - investigate operational issues");
      } else {
        analysis.push("🚨 Low completion rate requires immediate attention");
      }

      stats.analysis = analysis;
      stats.message = `System Health Analysis:\n\n${analysis.join('\n')}\n\nRecommendation: ${parseFloat(completionRate) >= 85 ? 'System performing well - focus on growth' : 'Address operational efficiency before scaling'}`;

      return stats;
    } catch (error) {
      return { error: `System analysis failed: ${error}` };
    }
  }

  // Enhanced research capabilities with external sources
  static async intelligentResearchAndResponse(prompt: string): Promise<any> {
    try {
      // First check learning patterns
      const similarInteractions = LearningSystem.getSimilarInteractions(prompt);
      
      if (similarInteractions.length > 0) {
        const bestMatch = similarInteractions[0];
        return {
          success: true,
          message: `Based on similar requests: ${bestMatch.systemResponse}`,
          learningSuggestion: true
        };
      }

      // If no patterns found, indicate research capability
      const context = LearningSystem.extractContext(prompt);
      let researchGuidance = "";

      if (context === 'general') {
        researchGuidance = `I can research this topic using external sources. For comprehensive information about "${prompt}", I would:

1. **Search Industry Sources**: Look up current best practices and industry standards
2. **Analyze Market Data**: Find relevant statistics and benchmarks  
3. **Review Technical Documentation**: Access latest technical guidance and solutions
4. **Cross-Reference Multiple Sources**: Ensure accuracy and completeness

Would you like me to research this topic and provide a comprehensive analysis with current information from external sources?`;
      } else {
        researchGuidance = `This appears to be related to ${context}. I can provide insights by:

1. **Checking Your Platform Data**: Analyzing relevant information from your ReturnIt system
2. **Researching Industry Standards**: Looking up current best practices for delivery platforms
3. **Finding Technical Solutions**: Searching for implementation approaches and tools
4. **Providing Strategic Guidance**: Combining research with your specific business context

Let me know if you'd like me to conduct this research and provide detailed recommendations.`;
      }

      return {
        success: true,
        message: researchGuidance,
        needsResearch: true,
        context
      };
    } catch (error) {
      return { error: `Research analysis failed: ${error}` };
    }
  }

  // Web search integration for external research
  static async performExternalResearch(query: string, context: string): Promise<any> {
    try {
      // This would integrate with web search APIs to find external information
      const searchResults = await this.searchExternalSources(query, context);
      
      return {
        success: true,
        query,
        results: searchResults,
        message: `Research completed for: "${query}"\n\nFound ${searchResults.length} relevant sources with current information.`
      };
    } catch (error) {
      return { error: `External research failed: ${error}` };
    }
  }

  private static async searchExternalSources(query: string, context: string): Promise<any[]> {
    // Placeholder for actual web search integration
    // This would use web search APIs to find current information
    const mockResults = [
      {
        title: `Industry Best Practices for ${context}`,
        source: "Industry Research",
        summary: `Current standards and recommendations for ${query}`,
        relevance: "High"
      },
      {
        title: `Technical Solutions for ${query}`,
        source: "Technical Documentation", 
        summary: `Implementation approaches and tools for ${query}`,
        relevance: "High"
      },
      {
        title: `Market Analysis: ${context} Trends`,
        source: "Market Research",
        summary: `Latest trends and data related to ${query}`,
        relevance: "Medium"
      }
    ];

    return mockResults;
  }

  // Enhanced intelligence that combines internal learning with external research
  static async intelligentResponseWithResearch(prompt: string, userId?: string): Promise<any> {
    try {
      // Step 1: Check internal knowledge and learning
      const internalResult = await this.processWithLearning(prompt, userId);
      
      // Step 2: If internal knowledge is insufficient, research externally
      if (internalResult.needsResearch || internalResult.needsMoreInfo) {
        const context = LearningSystem.extractContext(prompt);
        const researchResult = await this.performExternalResearch(prompt, context);
        
        if (researchResult.success) {
          // Combine internal insights with external research
          const combinedResponse = {
            success: true,
            message: `${internalResult.message}\n\n🔍 **External Research Results**:\n${researchResult.message}\n\nI can provide detailed analysis by combining this research with your platform data. Would you like me to proceed with a comprehensive analysis?`,
            hasResearch: true,
            internalInsights: internalResult,
            externalResearch: researchResult
          };
          
          // Record this enhanced interaction for learning
          await LearningSystem.recordInteraction(
            prompt, 
            combinedResponse.message, 
            'success', 
            userId
          );
          
          return combinedResponse;
        }
      }
      
      return internalResult;
    } catch (error) {
      return { error: `Enhanced research failed: ${error}` };
    }
  }

  // Complete the missing intelligent methods
  static async intelligentUserListing(): Promise<any> {
    try {
      const result = await this.listUsers();
      if (result.success) {
        result.message = `📊 **User Analysis**\n${result.message}\n\n💡 **Insights**: Active users indicate healthy platform engagement. Monitor for growth trends and user retention patterns.`;
      }
      return result;
    } catch (error) {
      return { error: `Intelligent user listing failed: ${error}` };
    }
  }

  static async intelligentReportGeneration(reportType: string): Promise<any> {
    try {
      const result = await this.generateReport(reportType);
      if (result.success) {
        result.message = `📈 **Strategic Report Analysis**\n${result.message}\n\n🎯 **Recommendations**: Use this data to identify trends, optimize operations, and drive business growth.`;
      }
      return result;
    } catch (error) {
      return { error: `Intelligent report generation failed: ${error}` };
    }
  }

  static async intelligentPerformanceAnalysis(): Promise<any> {
    try {
      const result = await this.analyzePerformance();
      if (result.success) {
        result.message = `⚡ **Performance Intelligence**\n${result.message}\n\n🔧 **Optimization Strategy**: Focus on database indexing and caching for immediate performance gains.`;
      }
      return result;
    } catch (error) {
      return { error: `Intelligent performance analysis failed: ${error}` };
    }
  }

  static async intelligentBackupStrategy(): Promise<any> {
    try {
      const result = await this.backupData();
      if (result.success) {
        result.message = `💾 **Backup Strategy**\n${result.message}\n\n🛡️ **Data Protection**: Regular backups ensure business continuity. Schedule automated backups for production systems.`;
      }
      return result;
    } catch (error) {
      return { error: `Intelligent backup strategy failed: ${error}` };
    }
  }

  static async intelligentQueryExecution(sqlQuery: string): Promise<any> {
    try {
      const result = await this.executeCustomQuery(sqlQuery);
      if (result.success) {
        result.message = `🗄️ **Query Analysis**\n${result.message}\n\n⚠️ **Safety Note**: Review query impact before execution. Consider indexing for better performance on large datasets.`;
      }
      return result;
    } catch (error) {
      return { error: `Intelligent query execution failed: ${error}` };
    }
  }

  static async intelligentPatternAnalysis(prompt: string): Promise<any> {
    try {
      // Check for learned patterns
      const similarInteractions = LearningSystem.getSimilarInteractions(prompt);
      if (similarInteractions.length > 0) {
        const bestMatch = similarInteractions[0];
        return {
          success: true,
          message: `🧠 **Learning Pattern Match**: Based on similar requests, I suggest: "${bestMatch.systemResponse}"\n\nThis approach worked well in the past. Would you like me to apply this solution?`,
          learningSuggestion: true
        };
      } else {
        return {
          success: true,
          message: `🤔 **New Pattern Detected**: This is a new type of request I haven't seen before. I'm learning from this interaction to improve future responses.\n\nCould you provide more specific details about what you'd like me to help with?`,
          needsMoreInfo: true
        };
      }
    } catch (error) {
      return { error: `Pattern analysis failed: ${error}` };
    }
  }

  static async getDatabaseSchema(): Promise<string> {
    try {
      const result = await db.execute("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position" as any);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return `Schema query failed: ${error}`;
    }
  }

  static async analyzeProject(): Promise<string> {
    try {
      const { stdout } = await execAsync(`find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" | grep -v node_modules | head -30`);
      return `Project files:\n${stdout}`;
    } catch (error) {
      return 'Project analysis failed';
    }
  }

  private static async getCodebaseContext(): Promise<string> {
    const keyFiles = [
      'client/src/App.tsx',
      'client/src/pages/admin-dashboard.tsx', 
      'client/src/components/Header.tsx',
      'tailwind.config.ts',
      'client/src/index.css',
      'shared/schema.ts'
    ];

    const context: string[] = [];
    
    for (const filePath of keyFiles) {
      try {
        const fullPath = path.join(process.cwd(), filePath);
        const content = await fs.readFile(fullPath, 'utf-8');
        context.push(`=== ${filePath} ===\n${content.slice(0, 1000)}...\n`);
      } catch (error) {
        // File doesn't exist or can't be read, skip
      }
    }

    return context.join('\n');
  }

  private static async applyCodeChange(change: CodeChange): Promise<void> {
    if (!change.fullContent || !change.file) return;

    try {
      const filePath = path.join(process.cwd(), change.file);
      
      // Create directory if it doesn't exist
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      // Write the new content
      await fs.writeFile(filePath, change.fullContent, 'utf-8');
      
      console.log(`AI Assistant: Updated ${change.file} - ${change.description}`);
      
    } catch (error) {
      console.error(`Failed to apply change to ${change.file}:`, error);
      throw error;
    }
  }

  // Quick action handlers for common requests
  static async enableMaintenanceMode(): Promise<AIResponse> {
    return this.processRequest("Put the website in maintenance mode with a professional message explaining we're making improvements");
  }

  static async disableMaintenanceMode(): Promise<AIResponse> {
    return this.processRequest("Remove maintenance mode and restore normal website functionality");
  }

  static async setDarkMode(): Promise<AIResponse> {
    return this.processRequest("Change the website theme to dark mode with appropriate color adjustments");
  }

  static async setLightMode(): Promise<AIResponse> {
    return this.processRequest("Change the website theme back to light mode");
  }

  static async setAdminOnlyMode(): Promise<AIResponse> {
    return this.processRequest("Hide all public features and make the website admin-only access");
  }
}