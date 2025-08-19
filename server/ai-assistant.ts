import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

// Initialize OpenAI (will be configured when API key is available)
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
  });
}

interface CodeChange {
  file: string;
  description: string;
  preview: string;
  fullContent?: string;
}

interface AIResponse {
  message: string;
  codeChanges: CodeChange[];
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
- Change themes and colors
- Toggle maintenance mode
- Update UI components and layouts  
- Modify database schemas
- Add/remove features
- Update business logic
- Configure access controls

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
        codeChanges: []
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
        codeChanges: []
      };
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