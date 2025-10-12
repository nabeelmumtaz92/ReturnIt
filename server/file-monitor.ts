import fs from "fs";
import path from "path";
import { KnowledgeBaseManager } from "./knowledge-base-manager";

/**
 * FileMonitor - Watches critical files and auto-refreshes AI knowledge
 * 
 * Monitors replit.md, schema.ts, routes.ts for changes and triggers
 * automatic knowledge base updates
 */

export class FileMonitor {
  private static watchers: fs.FSWatcher[] = [];
  private static isMonitoring = false;
  private static debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  
  /**
   * Start monitoring critical files
   */
  static startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('[FileMonitor] Already monitoring files');
      return;
    }
    
    const filesToWatch = [
      'replit.md',
      'shared/schema.ts',
      'server/routes.ts'
    ];
    
    console.log('[FileMonitor] Starting file monitoring...');
    
    for (const file of filesToWatch) {
      const filePath = path.join(process.cwd(), file);
      
      try {
        const watcher = fs.watch(filePath, (eventType, filename) => {
          if (eventType === 'change') {
            this.handleFileChange(file);
          }
        });
        
        this.watchers.push(watcher);
        console.log(`[FileMonitor] Watching ${file}`);
        
      } catch (error) {
        console.error(`[FileMonitor] Error watching ${file}:`, error);
      }
    }
    
    this.isMonitoring = true;
  }
  
  /**
   * Handle file change with debouncing
   */
  private static handleFileChange(file: string): void {
    // Clear existing timer for this file
    const existingTimer = this.debounceTimers.get(file);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new timer (wait 2 seconds after last change)
    const timer = setTimeout(() => {
      console.log(`[FileMonitor] Detected change in ${file}, refreshing knowledge...`);
      
      KnowledgeBaseManager.refreshKnowledge()
        .then(() => {
          console.log(`[FileMonitor] Knowledge base updated after ${file} change`);
        })
        .catch(err => {
          console.error(`[FileMonitor] Error refreshing knowledge:`, err);
        });
      
      this.debounceTimers.delete(file);
    }, 2000);
    
    this.debounceTimers.set(file, timer);
  }
  
  /**
   * Stop monitoring files
   */
  static stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }
    
    console.log('[FileMonitor] Stopping file monitoring...');
    
    for (const watcher of this.watchers) {
      watcher.close();
    }
    
    this.watchers = [];
    this.debounceTimers.clear();
    this.isMonitoring = false;
  }
  
  /**
   * Get monitoring status
   */
  static getStatus(): { isActive: boolean; filesWatched: number } {
    return {
      isActive: this.isMonitoring,
      filesWatched: this.watchers.length
    };
  }
}

// Start monitoring on module load (in production)
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_FILE_MONITORING === 'true') {
  FileMonitor.startMonitoring();
}
