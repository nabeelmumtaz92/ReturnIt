import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  X, Terminal, Minimize2, Maximize2, Send, Bot, Code, Database,
  Brain, TrendingUp, Users, Package, DollarSign, Activity, 
  MessageSquare, Settings, RefreshCw, Monitor, Play, RotateCcw,
  Sparkles, Eye, Power, Zap, CheckCircle, AlertTriangle,
  HeadphonesIcon, User, Phone, Cpu
} from "lucide-react";

interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'support';
  content: string;
  timestamp: Date;
  status?: 'processing' | 'completed' | 'error' | 'thinking' | 'executing';
  source?: 'embedded' | 'replit' | 'support';
  metadata?: {
    processingTime?: number;
    command?: string;
    confidence?: number;
    sources?: string[];
    category?: string;
    agent?: string;
    escalated?: boolean;
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
  defaultMode?: 'terminal' | 'chat' | 'hybrid' | 'support';
  supportContext?: {
    type: 'driver' | 'customer';
    name: string;
    orderId?: string;
    userId?: string;
  };
}

interface PlatformMetrics {
  activeUsers: number;
  totalOrders: number;
  revenue: number;
  systemHealth: number;
  responseTime: number;
  errorRate: number;
}

export default function UnifiedAI({ onClose, isMinimized, standalone = false, defaultMode = 'hybrid', supportContext }: UnifiedAIProps) {
  // State management
  const [isExpanded, setIsExpanded] = useState(!isMinimized);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [uiMode, setUiMode] = useState<'terminal' | 'chat' | 'hybrid' | 'support'>(defaultMode);
  const [activeAISource, setActiveAISource] = useState<'embedded' | 'replit'>('embedded');
  const [isEscalated, setIsEscalated] = useState(false);
  const [questionStep, setQuestionStep] = useState(0);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Real-time platform metrics
  const { data: platformMetrics } = useQuery<PlatformMetrics>({
    queryKey: ['/api/analytics/platform-metrics'],
    refetchInterval: 30000,
  });

  // Support questions for support mode
  const supportQuestions = [
    "What type of issue are you experiencing today?",
    "When did this issue first occur?", 
    "What steps have you already tried to resolve this?",
    "Are you experiencing this issue on a specific order? If so, what's the order number?",
    "How urgent is this issue for you?"
  ];

  // Unified AI messages with enhanced system boot
  const [messages, setMessages] = useState<AIMessage[]>(() => {
    const getSystemMessage = (): AIMessage => {
      if (uiMode === 'support') {
        return {
          id: '1',
          type: 'system',
          content: `🎧 ReturnIt Support Center - We're here to help!

Hello ${supportContext?.name || 'there'}! I'm your support assistant. I'll ask you a few quick questions to better understand your situation and provide the best possible assistance.

Support Context:
${supportContext?.type === 'driver' ? '🚛 Driver Support' : '👤 Customer Support'}
${supportContext?.orderId ? `📦 Order: ${supportContext.orderId}` : ''}

Let's get started!`,
          timestamp: new Date(),
          status: 'completed',
          source: 'support'
        };
      } else if (uiMode === 'terminal') {
        return {
          id: '1',
          type: 'system',
          content: `ReturnIt AI Terminal v3.0.1 (x86_64-linux-gnu)
Copyright (c) 2025 ReturnIt Systems. All rights reserved.

System Information:
 - Platform: ReturnIt Delivery Management System
 - Kernel: AI-Enhanced Terminal 3.0.1
 - Uptime: ${new Date().toLocaleString()}
 - Status: OPERATIONAL
 - Security: ENHANCED
 - AI Engine: GPT-5 Integration Active
 - Dual AI: ${activeAISource === 'embedded' ? 'Embedded AI' : 'Development AI'} Active

Available Commands:
  help          - Show available commands
  status        - Platform health status
  users         - User management
  orders        - Order management
  drivers       - Driver management
  analytics     - Business analytics
  clear         - Clear terminal
  ai embedded   - Switch to embedded AI
  ai replit     - Switch to development AI
  mode [type]   - Switch interface mode (terminal/chat/hybrid/support)

Type 'help' for detailed command information.
Type your request or command below:`,
          timestamp: new Date(),
          status: 'completed'
        };
      } else {
        return {
          id: '1',
          type: 'system',
          content: `🤖 ReturnIt AI Assistant - Dual AI System Ready!

Hi! I'm your intelligent assistant powered by dual AI systems:

🔧 **Embedded AI**: Direct codebase access with full platform control
🧠 **Development AI**: Advanced analysis and comprehensive tooling

I can help you with:

📊 Business Analytics & Insights
👥 Customer & Driver Management  
📦 Order Processing & Tracking
💰 Financial Analysis & Reporting
🔧 System Administration & Support
📈 Performance Optimization
💻 Code Analysis & Development

Currently using: **${activeAISource === 'embedded' ? 'Embedded AI' : 'Development AI'}**

You can switch AI sources anytime or ask me anything about your platform!

How can I assist you today?`,
          timestamp: new Date(),
          status: 'completed'
        };
      }
    };
    
    return [getSystemMessage()];
  });

  // Embedded AI mutation
  const embeddedAIMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const endpoint = uiMode === 'terminal' ? '/console/ai' : '/api/ai/assistant';
      const response = await apiRequest('POST', endpoint, { 
        prompt,
        mode: uiMode,
        includeMetrics: true,
        includeContext: true,
        context: supportContext
      });
      return response.json();
    },
    onSuccess: (data) => {
      handleAIResponse(data, 'embedded');
    },
    onError: (error) => {
      handleAIError(error, 'embedded');
    }
  });

  // Development AI mutation (simulated)
  const replitAIMutation = useMutation({
    mutationFn: async (prompt: string) => {
      // Simulate advanced development AI processing
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            message: `🧠 **Development AI Response**:

I understand you want: "${prompt}"

As your advanced development assistant, I would:
1. Analyze your entire codebase structure
2. Check for dependencies and conflicts
3. Implement the change with proper testing
4. Validate the solution across your stack
5. Provide comprehensive documentation

*Note: This simulates advanced AI capabilities. Your embedded AI can perform these actions directly!*`,
            source: 'replit',
            analysisComplete: true
          });
        }, 2000);
      });
    },
    onSuccess: (data) => {
      handleAIResponse(data, 'replit');
    },
    onError: (error) => {
      handleAIError(error, 'replit');
    }
  });
  // Handle AI responses
  const handleAIResponse = (data: any, source: 'embedded' | 'replit') => {
    const processingTime = Date.now() - processingStartTime;
    
    setMessages(prev => prev.map(msg => 
      msg.id === currentProcessingId 
        ? {
            ...msg,
            type: 'assistant',
            content: data.message || data.content || "Task completed successfully.",
            status: data.error ? 'error' : 'completed',
            source,
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

    if (data.codeChanges?.length > 0) {
      toast({
        title: `${source === 'embedded' ? 'Embedded' : 'Development'} AI - Changes Applied`,
        description: `Updated ${data.codeChanges.length} file(s)`,
      });
    }
  };

  // Handle AI errors
  const handleAIError = (error: any, source: 'embedded' | 'replit') => {
    const processingTime = Date.now() - processingStartTime;
    
    setMessages(prev => prev.map(msg => 
      msg.id === currentProcessingId 
        ? {
            ...msg,
            type: 'assistant',
            content: `Error: ${error.message || 'Something went wrong. Please try again.'}`,
            status: 'error',
            source,
            metadata: { ...msg.metadata, processingTime }
          }
        : msg
    ));
    
    setIsProcessing(false);
    toast({
      title: `${source === 'embedded' ? 'Embedded' : 'Development'} AI Error`,
      description: error.message || "Something went wrong",
      variant: "destructive",
    });
  };

  let processingStartTime = 0;
  let currentProcessingId = '';

  // Support mode functions
  const handleSupportMessage = () => {
    if (!input.trim()) return;
    
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
      status: 'completed'
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentResponse = input;
    setInput('');
    
    if (!isEscalated) {
      const newResponses = [...userResponses, currentResponse];
      setUserResponses(newResponses);
      
      // Simulate AI thinking
      const thinkingMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Let me process your response...',
        timestamp: new Date(),
        status: 'thinking',
        source: 'support'
      };
      
      setMessages(prev => [...prev, thinkingMessage]);
      setIsProcessing(true);
      
      setTimeout(() => {
        setIsProcessing(false);
        setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
        
        if (questionStep < supportQuestions.length - 1) {
          const nextStep = questionStep + 1;
          setQuestionStep(nextStep);
          const nextMessage: AIMessage = {
            id: (Date.now() + 2).toString(),
            type: 'assistant',
            content: supportQuestions[nextStep],
            timestamp: new Date(),
            status: 'completed',
            source: 'support'
          };
          setMessages(prev => [...prev, nextMessage]);
        } else {
          const finalMessage: AIMessage = {
            id: (Date.now() + 2).toString(),
            type: 'assistant',
            content: "Thank you for providing those details! Based on your responses, I can see you need assistance. Would you like me to connect you with a human support agent who can provide personalized help with your specific situation?",
            timestamp: new Date(),
            status: 'completed',
            source: 'support'
          };
          setMessages(prev => [...prev, finalMessage]);
        }
      }, 1500);
    }
  };

  // Escalate to human support
  const handleEscalate = () => {
    setIsEscalated(true);
    const escalateMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: "Connecting you with a human support agent. Please wait...",
      timestamp: new Date(),
      status: 'processing',
      source: 'support'
    };
    setMessages(prev => [...prev, escalateMessage]);
    
    setTimeout(() => {
      const supportAgents = ['Sarah', 'Mike', 'Jessica', 'David', 'Emily'];
      const randomAgent = supportAgents[Math.floor(Math.random() * supportAgents.length)];
      const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      const agentMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'support',
        content: `Hi ${supportContext?.name || 'there'}! This is ${randomAgent} from ReturnIt Support (${currentTime}). I'm here to help you resolve this issue. How can I assist you today?`,
        timestamp: new Date(),
        status: 'completed',
        source: 'support',
        metadata: { agent: randomAgent, escalated: true }
      };
      
      setMessages(prev => prev.map(msg => 
        msg.content === "Connecting you with a human support agent. Please wait..."
          ? { ...msg, status: 'completed' as const }
          : msg
      ).concat([agentMessage]));
    }, 3000);
  };

  // Enhanced command processing
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    // Handle support mode differently
    if (uiMode === 'support') {
      handleSupportMessage();
      return;
    }

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
      const newMode = command.split(' ')[1] as 'terminal' | 'chat' | 'hybrid' | 'support';
      if (['terminal', 'chat', 'hybrid', 'support'].includes(newMode)) {
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
    
    if (command.startsWith('ai ')) {
      const newSource = command.split(' ')[1] as 'embedded' | 'replit';
      if (['embedded', 'replit'].includes(newSource)) {
        setActiveAISource(newSource);
        setMessages(prev => prev.map(msg => 
          msg.id === processingMessage.id 
            ? {
                ...msg,
                content: `✅ Switched to ${newSource === 'embedded' ? 'Embedded AI' : 'Development AI'}`,
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

    // Process with AI based on mode and source
    if (uiMode === 'support') {
      handleSupportMessage();
      return;
    }
    
    processingStartTime = Date.now();
    currentProcessingId = processingMessage.id;
    setIsProcessing(true);
    setInput('');
    
    // Send to appropriate AI based on active source
    if (activeAISource === 'embedded') {
      embeddedAIMutation.mutate(userMessage.content);
    } else {
      replitAIMutation.mutate(userMessage.content);
    }
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

  // Don't render floating button if controlled by parent (not standalone)
  if (!isExpanded && !standalone) {
    return null;
  }

  // Only render floating button in standalone mode
  if (!isExpanded && standalone) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg"
        >
          {uiMode === 'terminal' ? <Terminal className="w-6 h-6" /> : 
           uiMode === 'support' ? <HeadphonesIcon className="w-6 h-6" /> : 
           <Bot className="w-6 h-6" />}
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