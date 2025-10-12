import fs from "fs/promises";
import path from "path";

/**
 * KnowledgeBaseManager - Auto-generates fresh AI knowledge from codebase
 * 
 * Scans critical files (replit.md, schema.ts, routes.ts) and creates
 * up-to-date system prompts for Gemini AI assistant
 */

interface KnowledgeSnapshot {
  platformOverview: string;
  techStack: string;
  dataModels: string[];
  apiEndpoints: string[];
  features: string[];
  integrations: string[];
  lastUpdated: Date;
  sources: string[];
}

export class KnowledgeBaseManager {
  private static knowledgeSnapshot: KnowledgeSnapshot | null = null;
  private static lastScanTime: Date | null = null;
  
  /**
   * Scan codebase and generate fresh knowledge snapshot
   */
  static async refreshKnowledge(): Promise<KnowledgeSnapshot> {
    console.log('[KnowledgeBase] Starting codebase scan...');
    
    const sources: string[] = [];
    const dataModels: string[] = [];
    const apiEndpoints: string[] = [];
    const features: string[] = [];
    const integrations: string[] = [];
    
    // Read replit.md for platform overview and architecture
    let platformOverview = '';
    let techStack = '';
    
    try {
      const replitMdPath = path.join(process.cwd(), 'replit.md');
      const replitContent = await fs.readFile(replitMdPath, 'utf-8');
      sources.push('replit.md');
      
      // Extract overview section
      const overviewMatch = replitContent.match(/# Overview\n\n(.*?)\n\n#/s);
      if (overviewMatch) {
        platformOverview = overviewMatch[1].trim();
      }
      
      // Extract tech stack and architecture
      const archMatch = replitContent.match(/## Frontend\n(.*?)## Backend\n(.*?)## Data Storage\n(.*?)\n\n/s);
      if (archMatch) {
        techStack = `Frontend: ${archMatch[1].trim()}\n\nBackend: ${archMatch[2].trim()}\n\nData Storage: ${archMatch[3].trim()}`;
      }
      
      // Extract features
      const featuresMatch = replitContent.match(/### Customer Features\n(.*?)### Driver Features/s);
      if (featuresMatch) {
        const featureLines = featuresMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
        features.push(...featureLines.map(f => f.trim().substring(2)));
      }
      
      // Extract integrations
      const integrationsMatch = replitContent.match(/## Integrations\n(.*?)\n\n/s);
      if (integrationsMatch) {
        const integrationLines = integrationsMatch[1].split('\n').filter(l => l.includes('**'));
        integrations.push(...integrationLines.map(i => i.replace(/\*\*/g, '').replace(/^-\s*/, '').trim()));
      }
      
    } catch (error) {
      console.error('[KnowledgeBase] Error reading replit.md:', error);
    }
    
    // Read schema.ts for data models
    try {
      const schemaPath = path.join(process.cwd(), 'shared/schema.ts');
      const schemaContent = await fs.readFile(schemaPath, 'utf-8');
      sources.push('shared/schema.ts');
      
      // Extract table definitions
      const tableMatches = schemaContent.matchAll(/export const (\w+) = pgTable\("(\w+)",/g);
      for (const match of tableMatches) {
        dataModels.push(match[1]);
      }
      
    } catch (error) {
      console.error('[KnowledgeBase] Error reading schema.ts:', error);
    }
    
    // Read routes.ts for API endpoints
    try {
      const routesPath = path.join(process.cwd(), 'server/routes.ts');
      const routesContent = await fs.readFile(routesPath, 'utf-8');
      sources.push('server/routes.ts');
      
      // Extract POST/GET/PUT/DELETE endpoints
      const endpointMatches = routesContent.matchAll(/app\.(get|post|put|delete|patch)\("([^"]+)"/g);
      const uniqueEndpoints = new Set<string>();
      
      for (const match of endpointMatches) {
        const method = match[1].toUpperCase();
        const path = match[2];
        uniqueEndpoints.add(`${method} ${path}`);
      }
      
      apiEndpoints.push(...Array.from(uniqueEndpoints).sort());
      
    } catch (error) {
      console.error('[KnowledgeBase] Error reading routes.ts:', error);
    }
    
    // Create knowledge snapshot
    this.knowledgeSnapshot = {
      platformOverview: platformOverview || 'ReturnIt - Reverse delivery service platform',
      techStack: techStack || 'React 18 + TypeScript, Express + Node.js, PostgreSQL',
      dataModels: dataModels.slice(0, 20), // Top 20 models
      apiEndpoints: apiEndpoints.slice(0, 30), // Top 30 endpoints
      features,
      integrations,
      lastUpdated: new Date(),
      sources
    };
    
    this.lastScanTime = new Date();
    
    console.log(`[KnowledgeBase] Scan complete! Found ${dataModels.length} models, ${apiEndpoints.length} endpoints`);
    
    return this.knowledgeSnapshot;
  }
  
  /**
   * Generate system prompt from knowledge snapshot
   */
  static async generateSystemPrompt(): Promise<string> {
    // Refresh if never scanned or older than 1 hour
    if (!this.knowledgeSnapshot || !this.lastScanTime || 
        (Date.now() - this.lastScanTime.getTime() > 60 * 60 * 1000)) {
      await this.refreshKnowledge();
    }
    
    const kb = this.knowledgeSnapshot!;
    const now = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    return `You are an AI assistant for the ReturnIt delivery platform admin dashboard. You can make real code changes to help manage the platform.

PLATFORM OVERVIEW (Auto-updated ${now}):
${kb.platformOverview}

TECH STACK:
${kb.techStack}

CORE DATA MODELS (${kb.dataModels.length} total):
${kb.dataModels.slice(0, 15).map(m => `- ${m}`).join('\n')}

KEY API ENDPOINTS (${kb.apiEndpoints.length} total):
${kb.apiEndpoints.slice(0, 20).map(e => `- ${e}`).join('\n')}

KEY FEATURES:
${kb.features.slice(0, 10).map(f => `- ${f}`).join('\n')}

INTEGRATIONS:
${kb.integrations.map(i => `- ${i}`).join('\n')}

CAPABILITIES:
- **File System Access**: Read/write any file in the codebase
- **Database Operations**: Query, modify, and analyze PostgreSQL data via Drizzle ORM
- **User Management**: Create, update, delete, list users with full data cleanup
- **Order Management**: Update order status, delete orders, track deliveries
- **Command Execution**: Run npm scripts, git commands, system operations
- **Code Analysis**: Search codebase, detect patterns, find dependencies
- **Administrative Tasks**: Driver payouts, tax reports, pricing config

SAFETY RULES:
- Always explain what changes you're making
- Show code previews before applying changes
- Never delete critical business data without confirmation
- Preserve authentication and security features
- Use npm run db:push --force for database schema changes
- Keep admin access restricted to authorized users

RESPONSE FORMAT:
- Explain what you understood from the request
- List the specific changes you'll make
- Provide code snippets for each file modification
- Confirm the changes are safe and reversible

---
Last knowledge update: ${kb.lastUpdated.toISOString()}
Sources scanned: ${kb.sources.join(', ')}`;
  }
  
  /**
   * Get current knowledge status
   */
  static getStatus(): {
    isReady: boolean;
    lastScanTime: Date | null;
    modelCount: number;
    endpointCount: number;
    sources: string[];
  } {
    return {
      isReady: this.knowledgeSnapshot !== null,
      lastScanTime: this.lastScanTime,
      modelCount: this.knowledgeSnapshot?.dataModels.length || 0,
      endpointCount: this.knowledgeSnapshot?.apiEndpoints.length || 0,
      sources: this.knowledgeSnapshot?.sources || []
    };
  }
  
  /**
   * Get detailed knowledge snapshot
   */
  static getSnapshot(): KnowledgeSnapshot | null {
    return this.knowledgeSnapshot;
  }
}
