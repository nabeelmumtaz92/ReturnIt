import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X, Terminal, Power, Minimize2, Maximize2 } from "lucide-react";

interface TerminalMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'processing' | 'completed' | 'error';
  metadata?: {
    processingTime?: number;
    command?: string;
  };
}

interface TerminalAIProps {
  onClose?: () => void;
  isMinimized?: boolean;
  standalone?: boolean; // For standalone app mode
}

interface PlatformMetrics {
  activeUsers: number;
  totalOrders: number;
  revenue: number;
  systemHealth: number;
  responseTime: number;
  errorRate: number;
}

export default function TerminalAI({ onClose, isMinimized, standalone = false }: TerminalAIProps) {
  // Terminal state
  const [isExpanded, setIsExpanded] = useState(!isMinimized);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Real-time platform metrics
  const { data: platformMetrics } = useQuery<PlatformMetrics>({
    queryKey: ['/api/analytics/platform-metrics'],
    refetchInterval: 30000,
  });

  // Terminal messages with system boot sequence
  const [messages, setMessages] = useState<TerminalMessage[]>(() => [
    {
      id: '1',
      type: 'system',
      content: `
ReturnIt AI Terminal v3.0.1 (x86_64-linux-gnu)
Copyright (c) 2025 ReturnIt Systems. All rights reserved.

System Information:
 - Platform: ReturnIt Delivery Management System
 - Kernel: AI-Enhanced Terminal 3.0.1
 - Uptime: ${new Date().toLocaleString()}
 - Status: OPERATIONAL
 - Security: ENHANCED
 - AI Engine: GPT-5 Integration Active

Available Commands:
  help          - Show available commands
  status        - Platform health status
  users         - User management
  orders        - Order management  
  analytics     - Business analytics
  security      - Security operations
  clear         - Clear terminal
  exit          - Close terminal

Type 'help <command>' for detailed information.
      `.trim(),
      timestamp: new Date(),
      status: 'completed'
    }
  ]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized]);

  // AI Processing mutation
  const aiMutation = useMutation({
    mutationFn: async (command: string) => {
      const startTime = Date.now();
      
      // Enhanced command with terminal context
      const terminalPrompt = `
Terminal Context: ReturnIt AI Terminal
Platform Metrics: ${platformMetrics ? `Users: ${platformMetrics.activeUsers}, Revenue: $${platformMetrics.revenue}, Health: ${platformMetrics.systemHealth}%` : 'Loading...'}
Timestamp: ${new Date().toISOString()}
Command: ${command}

Respond as a terminal AI assistant. Use technical language and provide concise, actionable responses.
      `;
      
      const response = await apiRequest('/api/ai/assistant', 'POST', { 
        prompt: terminalPrompt,
        context: {
          terminal: true,
          metrics: platformMetrics,
          timestamp: Date.now(),
          sessionId: 'terminal_session'
        }
      });
      
      return {
        ...response,
        metadata: {
          processingTime: Date.now() - startTime,
          command
        }
      };
    },
    onSuccess: (data: any) => {
      setMessages(prev => prev.map(msg => 
        msg.status === 'processing' 
          ? {
              ...msg,
              content: data.message || 'Command executed successfully.',
              status: 'completed',
              metadata: {
                ...msg.metadata,
                processingTime: data.metadata?.processingTime || 0
              }
            }
          : msg
      ));
      
      // Show execution time
      if (data.metadata?.processingTime) {
        toast({
          title: "Command Executed",
          description: `Completed in ${data.metadata.processingTime}ms`,
          duration: 2000,
        });
      }
    },
    onError: (error: any) => {
      setMessages(prev => prev.map(msg => 
        msg.status === 'processing' 
          ? {
              ...msg,
              content: `ERROR: ${error.message}`,
              status: 'error'
            }
          : msg
      ));
      
      toast({
        title: "Command Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  });

  // Command processor
  const processCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    
    // Built-in commands
    switch (command) {
      case 'clear':
        setMessages([messages[0]]); // Keep system message
        return;
      case 'exit':
        onClose?.();
        return;
      case 'help':
        addSystemMessage(`
Available Commands:
  help          - Show this help message
  status        - Show platform status and metrics
  users         - User management operations
  orders        - Order management and tracking
  analytics     - Business intelligence and reporting
  security      - Security audit and operations
  performance   - System performance analysis
  clear         - Clear terminal history
  exit          - Close terminal

AI Commands (prefix with '>' or just type naturally):
  > analyze platform performance
  > show user statistics
  > generate business report
  > check system security
  > optimize database performance

Examples:
  status
  > what is the current platform health?
  > show me today's revenue
  > analyze user behavior patterns
        `.trim());
        return;
      case 'status':
        if (platformMetrics) {
          addSystemMessage(`
Platform Status Report:
╭─────────────────────────────────────╮
│ ReturnIt System Status              │
├─────────────────────────────────────┤
│ Active Users:     ${platformMetrics.activeUsers.toString().padStart(6)}        │
│ Total Orders:     ${platformMetrics.totalOrders.toString().padStart(6)}        │
│ Revenue:          $${platformMetrics.revenue.toFixed(2).padStart(9)}    │
│ System Health:    ${platformMetrics.systemHealth.toString().padStart(6)}%       │
│ Response Time:    ${platformMetrics.responseTime.toString().padStart(6)}ms      │
│ Error Rate:       ${platformMetrics.errorRate.toFixed(2).padStart(6)}%        │
╰─────────────────────────────────────╯

System Status: ${platformMetrics.systemHealth >= 90 ? 'OPTIMAL' : platformMetrics.systemHealth >= 70 ? 'DEGRADED' : 'CRITICAL'}
Last Updated: ${new Date().toLocaleTimeString()}
        `.trim());
        } else {
          addSystemMessage('Loading platform metrics...');
        }
        return;
    }
    
    // AI command processing
    addUserMessage(cmd);
    addProcessingMessage();
    aiMutation.mutate(cmd);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  const addSystemMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'system',
      content,
      timestamp: new Date(),
      status: 'completed'
    }]);
  };

  const addProcessingMessage = () => {
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: 'Processing command...',
      timestamp: new Date(),
      status: 'processing'
    }]);
    setIsProcessing(true);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const command = input.trim();
    
    // Add to history
    setCommandHistory(prev => [...prev.slice(-50), command]); // Keep last 50 commands
    setHistoryIndex(-1);
    
    processCommand(command);
    setInput('');
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex] || '');
        }
      }
    }
  };

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={onClose} 
          className="rounded w-12 h-8 bg-black border border-green-400 text-green-400 hover:bg-gray-900 font-mono text-xs"
        >
          <Terminal className="h-4 w-4" />
        </Button>
        {platformMetrics && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-black text-xs rounded px-1 animate-pulse">
            {platformMetrics.activeUsers}
          </div>
        )}
      </div>
    );
  }

  // Terminal window style
  const windowClass = standalone 
    ? "w-full h-screen" 
    : "fixed bottom-4 right-4 w-96 h-[600px] z-50";

  return (
    <div className={windowClass}>
      <Card className="h-full shadow-2xl border border-green-400 bg-black text-green-400 font-mono">
        {/* Terminal header with window controls */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-900 border-b border-green-400">
          <CardTitle className="text-xs font-medium flex items-center gap-1 text-green-400">
            <Terminal className="h-3 w-3" />
            <span className="text-white">returnit@ai-terminal</span>
            <span className="text-green-300">:</span>
            <span className="text-blue-400">~/admin</span>
            <span className="text-green-300">$</span>
            <span className="animate-pulse text-green-400 ml-1">█</span>
          </CardTitle>
          <div className="flex items-center gap-1">
            {/* Terminal window controls */}
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer" onClick={onClose}></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}></div>
              <div className="w-3 h-3 rounded-full bg-green-500 cursor-pointer"></div>
            </div>
            {!standalone && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 hover:bg-red-900 text-red-400 ml-2"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        {/* Terminal content */}
        <CardContent className="flex flex-col h-full p-0 bg-black">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-1 font-mono text-sm">
              {messages.map((message) => (
                <div key={message.id} className="mb-2">
                  {message.type === 'user' && (
                    <div className="flex items-start gap-1">
                      <span className="text-green-300">$</span>
                      <span className="text-white">{message.content}</span>
                    </div>
                  )}
                  
                  {message.type === 'system' && (
                    <div className="text-cyan-400 whitespace-pre-line leading-relaxed">
                      {message.content}
                    </div>
                  )}
                  
                  {message.type === 'assistant' && (
                    <div className="mb-1">
                      {message.status === 'processing' ? (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <span className="animate-spin">⣾</span>
                          <span>{message.content}</span>
                        </div>
                      ) : message.status === 'error' ? (
                        <div className="text-red-400">
                          <span className="text-red-500">[ERROR]</span> {message.content}
                        </div>
                      ) : (
                        <div className="text-green-400 whitespace-pre-line leading-relaxed">
                          {message.content}
                          {message.metadata?.processingTime && (
                            <div className="text-gray-500 text-xs mt-1">
                              Executed in {message.metadata.processingTime}ms
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Command input */}
          <div className="p-4 border-t border-green-400 bg-gray-900">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <span className="text-green-300 text-sm">$</span>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter command..."
                className="flex-1 bg-black border-0 text-green-400 placeholder-gray-600 focus:ring-1 focus:ring-green-400 font-mono text-sm"
                disabled={isProcessing}
                autoComplete="off"
                data-testid="terminal-input"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isProcessing || !input.trim()}
                className="bg-green-700 hover:bg-green-600 text-black font-mono text-xs"
                data-testid="terminal-submit"
              >
                {isProcessing ? '...' : 'EXEC'}
              </Button>
            </form>
            <div className="text-xs text-gray-500 mt-1">
              Use ↑/↓ for command history • Type 'help' for commands • 'clear' to reset • 'exit' to close
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export configuration for standalone app
export const TerminalAIConfig = {
  name: 'ReturnIt AI Terminal',
  version: '3.0.1',
  description: 'AI-powered terminal interface for ReturnIt platform management',
  standalone: true,
  requirements: {
    api: '/api/ai/assistant',
    metrics: '/api/analytics/platform-metrics'
  }
};