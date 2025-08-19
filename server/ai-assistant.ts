import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { db } from "./db";
import { storage } from "./storage";

// Initialize OpenAI (will be configured when API key is available)
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
  });
}

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

// System prompt that understands the ReturnIt codebase
const SYSTEM_PROMPT = `You are an AI assistant for the ReturnIt delivery platform admin dashboard. You can make real code changes to help manage the platform.

CODEBASE STRUCTURE:
- Frontend: React + TypeScript in /client/src/
- Backend: Express + TypeScript in /server/
- Database: PostgreSQL with Drizzle ORM in /shared/schema.ts
- UI: Tailwind CSS + shadcn/ui components
- Theme: Cardboard/shipping theme with amber colors

CURRENT CAPABILITIES:
- **File System Access**: Read/write any file in the codebase
- **Database Operations**: Query, modify, and analyze PostgreSQL data
- **User Management**: Create, update, delete, and list users
- **Order Management**: Update order status, delete orders, track deliveries
- **Command Execution**: Run npm scripts, git commands, system operations
- **Code Analysis**: Search codebase, detect patterns, find dependencies
- **Real-time Debugging**: Access logs, check server status, monitor performance
- **Full Stack Changes**: Modify frontend, backend, database, and configurations
- **Testing & Validation**: Run tests, verify changes, check for errors
- **Deployment Operations**: Build, deploy, manage environments
- **Administrative Tasks**: Manage users, orders, drivers, payments, and platform settings

SAFETY RULES:
- Always explain what changes you're making
- Show code previews before applying
- Never delete critical business data
- Preserve authentication and security features
- Test changes are backwards compatible

RESPONSE FORMAT:
- Explain what you understood from the request
- List the specific changes you'll make
- Provide code snippets for each file modification
- Confirm the changes are safe and reversible

COMMON REQUESTS:
- "Change theme to dark mode" -> Update CSS variables and component styles
- "Maintenance mode" -> Add site-wide maintenance banner/modal
- "Admin only" -> Hide public features, restrict access
- "Update colors" -> Modify theme colors in tailwind.config and CSS
- "Add feature" -> Create new components and routes
- "Delete user [email/id]" -> Remove user and all associated data from database
- "List users" -> Show recent users from database
- "Create user [email]" -> Add new user to the system
- "Update order status [id] to [status]" -> Change order status in database
- "Delete order [id]" -> Remove order from system

Remember: You're making real changes to a live platform. Be thorough and safe.`;

export class AIAssistant {
  
  static async processRequest(prompt: string): Promise<AIResponse> {
    if (!openai) {
      return {
        message: "OpenAI API key is not configured. Please add OPENAI_API_KEY to environment variables to enable AI assistance.",
        codeChanges: [],
        databaseQueries: [],
        commandResults: []
      };
    }

    try {
      // Get current codebase context (key files)
      const context = await this.getCodebaseContext();
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Latest model for best code understanding
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: `Current codebase context:\n${context}` },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3, // Lower temperature for more consistent code generation
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Validate and apply code changes
      if (response.codeChanges && Array.isArray(response.codeChanges)) {
        for (const change of response.codeChanges) {
          if (change.fullContent) {
            await this.applyCodeChange(change);
          }
        }
      }

      return {
        message: response.message || "Request processed successfully",
        codeChanges: response.codeChanges || [],
        needsConfirmation: response.needsConfirmation || false
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
      let query = "SELECT id, user_id, status, pickup_address, delivery_address, created_at FROM orders";
      if (status) {
        query += ` WHERE status = '${status}'`;
      }
      query += ` ORDER BY created_at DESC LIMIT ${limit}`;
      
      const result = await db.execute(query as any);
      return {
        success: true,
        orders: result,
        message: `Retrieved ${Array.isArray(result) ? result.length : 0} orders${status ? ` with status '${status}'` : ''}`
      };
    } catch (error) {
      return { error: `Failed to search orders: ${error}` };
    }
  }

  static async executeCustomQuery(sql: string): Promise<any> {
    try {
      // Basic safety checks for destructive operations
      const safeSql = sql.toLowerCase().trim();
      if (safeSql.includes('drop table') || safeSql.includes('truncate') || safeSql.includes('delete from users')) {
        return { error: "Potentially destructive query blocked for safety. Use specific user deletion commands instead." };
      }
      
      const result = await db.execute(sql as any);
      return {
        success: true,
        result: result,
        message: `Query executed successfully. Returned ${Array.isArray(result) ? result.length : 1} result(s).`
      };
    } catch (error) {
      return { error: `Query failed: ${error}` };
    }
  }

  static async getRecentActivity(limit: number = 20): Promise<any> {
    try {
      const activities = await db.execute(`
        SELECT 'order' as type, id, status, created_at, pickup_address as details FROM orders 
        UNION ALL 
        SELECT 'user' as type, id, email as status, created_at, first_name as details FROM users 
        ORDER BY created_at DESC LIMIT ${limit}
      ` as any);
      
      return {
        success: true,
        activities: activities,
        message: `Retrieved ${Array.isArray(activities) ? activities.length : 0} recent activities`
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