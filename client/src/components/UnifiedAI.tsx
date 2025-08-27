import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  X, Terminal, Minimize2, Maximize2, Send, Bot, Code, Database,
  Brain, TrendingUp, Users, Package, DollarSign, Activity, 
  MessageSquare, Settings, RefreshCw, Monitor, Play, RotateCcw,
  Sparkles, Eye, Power, Zap, CheckCircle, AlertTriangle
} from "lucide-react";

interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'processing' | 'completed' | 'error';
  metadata?: {
    processingTime?: number;
    command?: string;
    confidence?: number;
    sources?: string[];
    category?: string;
  };
  codeChanges?: {
    file: string;
    description: string;
    preview: string;
  }[];
  databaseQueries?: {
    query: string;
    result: any;
    description: string;
  }[];
  commandResults?: {
    command: string;
    output: string;
    description: string;
  }[];
  businessInsights?: {
    type: 'trend' | 'recommendation' | 'alert' | 'metric';
    title: string;
    description: string;
    value?: string | number;
  }[];
}

interface UnifiedAIProps {
  onClose?: () => void;
  isMinimized?: boolean;
  standalone?: boolean;
  defaultMode?: 'terminal' | 'chat' | 'hybrid';
}

interface PlatformMetrics {
  activeUsers: number;
  totalOrders: number;
  revenue: number;
  systemHealth: number;
  responseTime: number;
  errorRate: number;
}

export default function UnifiedAI({ onClose, isMinimized, standalone = false, defaultMode = 'hybrid' }: UnifiedAIProps) {
  // State management
  const [isExpanded, setIsExpanded] = useState(!isMinimized);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [uiMode, setUiMode] = useState<'terminal' | 'chat' | 'hybrid'>(defaultMode);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Real-time platform metrics
  const { data: platformMetrics } = useQuery<PlatformMetrics>({
    queryKey: ['/api/analytics/platform-metrics'],
    refetchInterval: 30000,
  });

  // Unified AI messages with enhanced system boot
  const [messages, setMessages] = useState<AIMessage[]>(() => {
    const baseSystemMessage: AIMessage = {
      id: '1',
      type: 'system',
      content: uiMode === 'terminal' 
        ? `ReturnIt AI Terminal v3.0.1 (x86_64-linux-gnu)
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
  drivers       - Driver management
  analytics     - Business analytics
  clear         - Clear terminal
  mode [type]   - Switch interface mode (terminal/chat/hybrid)

Type 'help' for detailed command information.
Type your request or command below:`
        : `🤖 ReturnIt AI Assistant - Ready to help!

Hi! I'm your intelligent assistant for the ReturnIt platform. I can help you with:

📊 Business Analytics & Insights
👥 Customer & Driver Management  
📦 Order Processing & Tracking
💰 Financial Analysis & Reporting
🔧 System Administration & Support
📈 Performance Optimization

You can ask me anything about your platform, request data analysis, or get help with operations. I understand natural language and can execute complex tasks.

How can I assist you today?`,
      timestamp: new Date(),
      status: 'completed'
    };
    
    return [baseSystemMessage];
  });

  // Enhanced AI processing with OpenAI integration
  const aiMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/ai/query", { 
        prompt,
        mode: uiMode,
        includeMetrics: true,
        includeContext: true 
      });
      return response.json();
    },
    onSuccess: (data) => {
      const processingTime = Date.now() - processingStartTime;
      
      setMessages(prev => prev.map(msg => 
        msg.id === currentProcessingId 
          ? {
              ...msg,
              type: 'assistant',
              content: data.message || data.content || "Task completed successfully.",
              status: data.error ? 'error' : 'completed',
              codeChanges: data.codeChanges,
              databaseQueries: data.databaseQueries,
              commandResults: data.commandResults,
              businessInsights: data.businessInsights,
              metadata: {
                ...msg.metadata,
                processingTime,
                confidence: data.confidence,
                sources: data.sources,
                category: data.category
              }
            }
          : msg
      ));
      
      setIsProcessing(false);
    },
    onError: (error) => {
      const processingTime = Date.now() - processingStartTime;
      
      setMessages(prev => prev.map(msg => 
        msg.id === currentProcessingId 
          ? {
              ...msg,
              type: 'assistant',
              content: `Error: ${error.message || 'Something went wrong. Please try again.'}`,
              status: 'error',
              metadata: { ...msg.metadata, processingTime }
            }
          : msg
      ));
      
      setIsProcessing(false);
      toast({
        title: "AI Processing Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });

  let processingStartTime = 0;
  let currentProcessingId = '';

  // Enhanced command processing
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
      status: 'completed'
    };

    const processingMessage: AIMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: uiMode === 'terminal' ? 'Processing command...' : '🤔 Thinking...',
      timestamp: new Date(),
      status: 'processing'
    };

    setMessages(prev => [...prev, userMessage, processingMessage]);
    
    // Handle built-in commands
    const command = input.trim().toLowerCase();
    
    if (command === 'clear') {
      setMessages([]);
      setInput('');
      return;
    }
    
    if (command === 'help') {
      setMessages(prev => prev.map(msg => 
        msg.id === processingMessage.id 
          ? {
              ...msg,
              content: `Available Commands & Capabilities:

🎯 DIRECT COMMANDS:
  status        - System health & metrics
  users         - List and manage users
  orders        - Order management & tracking  
  drivers       - Driver management
  analytics     - Business intelligence
  clear         - Clear conversation
  mode terminal - Switch to terminal mode
  mode chat     - Switch to chat mode
  mode hybrid   - Switch to hybrid mode

💬 NATURAL LANGUAGE:
  "How many customers do we have?"
  "Show me today's revenue"
  "Create a new user account"
  "What orders are pending?"
  "Analyze driver performance"
  "Generate monthly report"

🔧 ADVANCED FEATURES:
  • Real-time data analysis
  • Code modifications
  • Database queries
  • Business insights
  • Performance monitoring
  • Administrative tasks

Type your request or command to get started!`,
              status: 'completed'
            }
          : msg
      ));
      setInput('');
      return;
    }
    
    if (command.startsWith('mode ')) {
      const newMode = command.split(' ')[1] as 'terminal' | 'chat' | 'hybrid';
      if (['terminal', 'chat', 'hybrid'].includes(newMode)) {
        setUiMode(newMode);
        setMessages(prev => prev.map(msg => 
          msg.id === processingMessage.id 
            ? {
                ...msg,
                content: `✅ Switched to ${newMode} mode`,
                status: 'completed'
              }
            : msg
        ));
        setInput('');
        return;
      }
    }

    // Add to command history
    setCommandHistory(prev => [input.trim(), ...prev.slice(0, 49)]);
    setHistoryIndex(-1);

    // Process with AI
    processingStartTime = Date.now();
    currentProcessingId = processingMessage.id;
    setIsProcessing(true);
    setInput('');
    
    aiMutation.mutate(userMessage.content);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input
  useEffect(() => {
    if (isExpanded && !isProcessing) {
      inputRef.current?.focus();
    }
  }, [isExpanded, isProcessing]);

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg"
        >
          {uiMode === 'terminal' ? <Terminal className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </Button>
      </div>
    );
  }

  const containerClasses = uiMode === 'terminal' 
    ? "fixed bottom-4 right-4 w-[800px] h-[600px] bg-black border-2 border-green-400 rounded-lg shadow-2xl z-50"
    : "fixed bottom-4 right-4 w-[800px] h-[600px] bg-white/95 backdrop-blur-sm border border-amber-200 rounded-lg shadow-2xl z-50";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className={uiMode === 'terminal' 
        ? "flex items-center justify-between p-3 border-b border-green-400 bg-black"
        : "flex items-center justify-between p-3 border-b border-amber-200 bg-amber-50/50"
      }>
        <div className="flex items-center gap-3">
          {uiMode === 'terminal' ? (
            <>
              <Terminal className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-mono text-sm">ReturnIt AI Terminal</span>
            </>
          ) : (
            <>
              <Bot className="w-5 h-5 text-amber-600" />
              <span className="text-amber-900 font-medium">AI Assistant</span>
            </>
          )}
          
          {platformMetrics && (
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className={uiMode === 'terminal' ? 'border-green-400 text-green-400' : 'border-amber-200 text-amber-600'}>
                {platformMetrics.activeUsers} Users
              </Badge>
              <Badge variant="outline" className={uiMode === 'terminal' ? 'border-green-400 text-green-400' : 'border-amber-200 text-amber-600'}>
                ${platformMetrics.revenue} Revenue
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const modes: ('terminal' | 'chat' | 'hybrid')[] = ['terminal', 'chat', 'hybrid'];
              const currentIndex = modes.indexOf(uiMode);
              const nextMode = modes[(currentIndex + 1) % modes.length];
              setUiMode(nextMode);
            }}
            className={uiMode === 'terminal' ? 'text-green-400 hover:bg-green-400/10' : 'text-amber-600 hover:bg-amber-100'}
          >
            {uiMode === 'terminal' ? <Terminal className="w-4 h-4" /> : 
             uiMode === 'chat' ? <MessageSquare className="w-4 h-4" /> : 
             <Sparkles className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className={uiMode === 'terminal' ? 'text-green-400 hover:bg-green-400/10' : 'text-amber-600 hover:bg-amber-100'}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>

          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={uiMode === 'terminal' ? 'text-green-400 hover:bg-green-400/10' : 'text-amber-600 hover:bg-amber-100'}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 h-[480px] p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className={`flex items-start gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                {message.type !== 'user' && (
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    uiMode === 'terminal' 
                      ? 'bg-green-400/20 text-green-400' 
                      : message.type === 'system' 
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-amber-100 text-amber-600'
                  }`}>
                    {message.type === 'system' ? <Monitor className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                )}

                <div className={`max-w-[70%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? uiMode === 'terminal' 
                      ? 'bg-green-400/20 text-green-300 font-mono text-sm'
                      : 'bg-amber-100 text-amber-900'
                    : message.type === 'system'
                      ? uiMode === 'terminal'
                        ? 'bg-black border border-green-400/30 text-green-400 font-mono text-xs'
                        : 'bg-blue-50 text-blue-900 border border-blue-200'
                      : uiMode === 'terminal'
                        ? 'bg-gray-900 border border-green-400/30 text-green-300 font-mono text-sm'
                        : 'bg-white border border-amber-200 text-amber-900'
                }`}>
                  {message.status === 'processing' ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                      <span>{message.content}</span>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                  )}

                  {/* Enhanced metadata display */}
                  {message.metadata && message.status === 'completed' && (
                    <div className="mt-2 pt-2 border-t border-current/20 text-xs opacity-60">
                      {message.metadata.processingTime && (
                        <span>⏱ {message.metadata.processingTime}ms</span>
                      )}
                      {message.metadata.confidence && (
                        <span className="ml-2">📊 {Math.round(message.metadata.confidence * 100)}% confident</span>
                      )}
                    </div>
                  )}

                  {/* Code changes */}
                  {message.codeChanges && message.codeChanges.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium opacity-80">📝 Code Changes:</p>
                      {message.codeChanges.map((change, i) => (
                        <div key={i} className="bg-black/20 p-2 rounded text-xs">
                          <div className="font-medium">{change.file}</div>
                          <div className="opacity-80">{change.description}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Business insights */}
                  {message.businessInsights && message.businessInsights.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium opacity-80">💡 Insights:</p>
                      {message.businessInsights.map((insight, i) => (
                        <div key={i} className="bg-black/20 p-2 rounded text-xs">
                          <div className="font-medium">{insight.title}</div>
                          <div className="opacity-80">{insight.description}</div>
                          {insight.value && (
                            <div className="font-mono mt-1">{insight.value}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {message.type === 'user' && (
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    uiMode === 'terminal' 
                      ? 'bg-blue-400/20 text-blue-400' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Users className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className={`p-4 border-t ${
        uiMode === 'terminal' ? 'border-green-400/30 bg-black' : 'border-amber-200 bg-white/50'
      }`}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          {uiMode === 'terminal' && (
            <span className="text-green-400 font-mono text-sm self-center">❯</span>
          )}
          
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              uiMode === 'terminal' 
                ? "Enter command or query..." 
                : "Ask me anything about your ReturnIt platform..."
            }
            disabled={isProcessing}
            className={uiMode === 'terminal' 
              ? 'flex-1 bg-transparent border-green-400/30 text-green-300 font-mono placeholder:text-green-600 focus:border-green-400'
              : 'flex-1 border-amber-200 focus:border-amber-400'
            }
          />
          
          <Button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className={uiMode === 'terminal'
              ? 'bg-green-400 hover:bg-green-500 text-black'
              : 'bg-amber-600 hover:bg-amber-700 text-white'
            }
          >
            {isProcessing ? (
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        
        {commandHistory.length > 0 && (
          <p className={`text-xs mt-2 opacity-60 ${
            uiMode === 'terminal' ? 'text-green-400' : 'text-amber-600'
          }`}>
            ↑↓ Navigate history • Enter to send • Shift+Enter for new line
          </p>
        )}
      </div>
    </div>
  );
}