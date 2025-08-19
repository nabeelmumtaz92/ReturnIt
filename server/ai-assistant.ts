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
- **Command Execution**: Run npm scripts, git commands, system operations
- **Code Analysis**: Search codebase, detect patterns, find dependencies
- **Real-time Debugging**: Access logs, check server status, monitor performance
- **Full Stack Changes**: Modify frontend, backend, database, and configurations
- **Testing & Validation**: Run tests, verify changes, check for errors
- **Deployment Operations**: Build, deploy, manage environments

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