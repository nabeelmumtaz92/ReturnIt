import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, Send, Code, Zap, AlertTriangle, CheckCircle, Clock, X, Database, 
  Brain, TrendingUp, Users, Package, DollarSign, BarChart3, Activity,
  Sparkles, Target, Lightbulb, Shield, Rocket, Monitor, Globe,
  MessageSquare, FileText, Settings, RefreshCw, Download, Upload,
  Search, Filter, ChevronDown, ChevronUp, Maximize2, Minimize2,
  Play, Pause, RotateCcw, Eye, EyeOff, Star, Heart, Bookmark
} from "lucide-react";

interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'thinking' | 'researching' | 'analyzing' | 'executing' | 'completed' | 'error';
  metadata?: {
    confidence?: number;
    sources?: string[];
    processingTime?: number;
    tokensUsed?: number;
    category?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
  codeChanges?: {
    file: string;
    description: string;
    preview: string;
    impact?: 'low' | 'medium' | 'high';
  }[];
  databaseQueries?: {
    query: string;
    result: any;
    description: string;
    executionTime?: number;
  }[];
  commandResults?: {
    command: string;
    output: string;
    description: string;
    exitCode?: number;
  }[];
  businessInsights?: {
    type: 'trend' | 'recommendation' | 'alert' | 'metric';
    title: string;
    description: string;
    value?: string | number;
    change?: number;
    actionable?: boolean;
  }[];
  isStreaming?: boolean;
  reactions?: string[];
}

interface AIAssistantProps {
  onClose?: () => void;
  isMinimized?: boolean;
  isDraggable?: boolean;
  persistHistory?: boolean;
}

interface PlatformMetrics {
  activeUsers: number;
  totalOrders: number;
  revenue: number;
  systemHealth: number;
  responseTime: number;
  errorRate: number;
}

export default function AIAssistant({ 
  onClose, 
  isMinimized, 
  isDraggable = true, 
  persistHistory = true 
}: AIAssistantProps) {
  // Enhanced state management
  const [isExpanded, setIsExpanded] = useState(!isMinimized);
  const [viewMode, setViewMode] = useState<'chat' | 'analytics' | 'insights'>('chat');
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  // Real-time platform metrics
  const { data: platformMetrics } = useQuery<PlatformMetrics>({
    queryKey: ['/api/analytics/platform-metrics'],
    refetchInterval: 30000, // Update every 30 seconds
  });
  // Load persisted chat history
  const [messages, setMessages] = useState<AIMessage[]>(() => {
    if (persistHistory && typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai_assistant_history');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        } catch {
          // If parsing fails, use default
        }
      }
    }
    
    return [
      {
        id: '1',
        type: 'assistant',
        content: `🚀 **Advanced AI Assistant v3.0** - Now with real-time intelligence!\n\n🧠 **Intelligent Capabilities**\n• Strategic business analysis with real-time data\n• External research & market intelligence\n• Predictive analytics & trend forecasting\n• Automated performance optimization\n• Risk assessment & mitigation strategies\n\n📊 **Live Platform Integration**\n• Real-time metrics: ${platformMetrics ? `${platformMetrics.activeUsers} users, $${platformMetrics.revenue.toLocaleString()} revenue` : 'Loading...'}\n• System health monitoring & alerts\n• User behavior analysis & insights\n• Performance bottleneck detection\n• Automated report generation\n\n🎯 **Enhanced Features**\n• Voice commands & natural language processing\n• Multi-modal analysis (text, data, code)\n• Proactive recommendations\n• Competitive intelligence\n• ROI impact predictions\n\n💡 **Quick Start Commands:**\n• "Analyze today's performance" - Comprehensive business analysis\n• "What's trending in delivery?" - Latest industry insights\n• "Optimize my platform" - Performance recommendations\n• "Predict next quarter" - Revenue & growth forecasting\n• "Security audit" - Risk assessment & recommendations\n\nI'm continuously learning from your platform data to provide smarter, more relevant insights. What would you like to explore today?`,
        timestamp: new Date(),
        status: 'completed',
        metadata: {
          confidence: 95,
          category: 'welcome',
          priority: 'medium'
        }
      }
    ];
  });
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Persist chat history
  useEffect(() => {
    if (persistHistory && messages.length > 1) {
      localStorage.setItem('ai_assistant_history', JSON.stringify(messages));
    }
  }, [messages, persistHistory]);

  const aiMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const startTime = Date.now();
      
      // Enhanced prompt with platform context
      const enhancedPrompt = `
Platform Context: ReturnIt delivery platform
Current Metrics: ${platformMetrics ? `Active Users: ${platformMetrics.activeUsers}, Revenue: $${platformMetrics.revenue}, Health: ${platformMetrics.systemHealth}%` : 'Loading metrics...'}
Timestamp: ${new Date().toISOString()}
User Request: ${prompt}
      `;
      
      const response = await apiRequest('/api/ai/assistant', 'POST', { 
        prompt: enhancedPrompt,
        context: {
          metrics: platformMetrics,
          timestamp: Date.now(),
          sessionId: 'admin_session',
          capabilities: ['research', 'analysis', 'code_execution', 'business_intelligence']
        }
      });
      
      return {
        ...response,
        metadata: {
          ...response.metadata,
          processingTime: Date.now() - startTime
        }
      };
    },
    onSuccess: (data: any) => {
      setMessages(prev => prev.map(msg => 
        msg.status === 'thinking' || msg.status === 'researching' || msg.status === 'analyzing' 
          ? {
              ...msg,
              content: data.message || 'Task completed successfully!',
              status: 'completed',
              codeChanges: data.codeChanges,
              databaseQueries: data.databaseQueries,
              commandResults: data.commandResults,
              businessInsights: data.businessInsights,
              metadata: {
                ...msg.metadata,
                ...data.metadata,
                confidence: data.confidence || 85,
                sources: data.sources || [],
                processingTime: data.metadata?.processingTime || 0
              }
            }
          : msg
      ));
      
      // Enhanced notifications with more context
      if (data.codeChanges?.length > 0) {
        const highImpactChanges = data.codeChanges.filter((c: any) => c.impact === 'high').length;
        toast({
          title: "Code Changes Applied",
          description: `Updated ${data.codeChanges.length} file(s)${highImpactChanges > 0 ? ` (${highImpactChanges} high-impact)` : ''}`,
          duration: 5000,
        });
      }
      
      if (data.businessInsights?.length > 0) {
        const criticalInsights = data.businessInsights.filter((i: any) => i.priority === 'critical').length;
        toast({
          title: "Business Insights Generated",
          description: `Found ${data.businessInsights.length} insights${criticalInsights > 0 ? ` (${criticalInsights} critical)` : ''}`,
          duration: 7000,
        });
      }
      
      if (data.databaseQueries?.length > 0) {
        toast({
          title: "Database Analysis Complete",
          description: `Executed ${data.databaseQueries.length} query(s) in ${data.metadata?.processingTime || 0}ms`,
        });
      }
      
      if (data.commandResults?.length > 0) {
        const failedCommands = data.commandResults.filter((c: any) => c.exitCode !== 0).length;
        toast({
          title: "System Commands Executed",
          description: `${data.commandResults.length} command(s)${failedCommands > 0 ? ` (${failedCommands} failed)` : ' (all successful)'}`,
          variant: failedCommands > 0 ? "destructive" : "default",
        });
      }
    },
    onError: (error: any) => {
      setMessages(prev => prev.map(msg => 
        msg.status === 'thinking' 
          ? {
              ...msg,
              content: `I encountered an error while processing your request: ${error.message}. Please try rephrasing your request or let me know if you need help with something else.`,
              status: 'error'
            }
          : msg
      ));
      
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  // Enhanced AI command processing
  const processCommand = (input: string): { isCommand: boolean; command?: string; params?: any } => {
    const trimmed = input.trim();
    
    // Quick command shortcuts
    const commands = {
      '/health': { command: 'platform_health', params: {} },
      '/performance': { command: 'performance_audit', params: {} },
      '/revenue': { command: 'revenue_analysis', params: {} },
      '/users': { command: 'user_analytics', params: {} },
      '/security': { command: 'security_scan', params: {} },
      '/optimize': { command: 'optimization_recommendations', params: {} },
      '/predict': { command: 'growth_predictions', params: {} },
      '/compare': { command: 'competitive_analysis', params: {} }
    };
    
    for (const [trigger, config] of Object.entries(commands)) {
      if (trimmed.startsWith(trigger)) {
        return { isCommand: true, ...config };
      }
    }
    
    return { isCommand: false };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userInput = input.trim();
    const commandResult = processCommand(userInput);

    // Add user message with enhanced metadata
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date(),
      metadata: {
        category: commandResult.isCommand ? 'command' : 'query',
        priority: commandResult.isCommand ? 'high' : 'medium'
      }
    }]);
    
    // Add thinking/processing message with enhanced status
    const statusMessage = commandResult.isCommand 
      ? `🔄 Executing ${commandResult.command?.replace('_', ' ')} command...` 
      : '🧠 Analyzing your request and gathering insights...';
    
    const processingStatus = commandResult.isCommand ? 'executing' : 'thinking';

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: statusMessage,
      timestamp: new Date(),
      status: processingStatus,
      metadata: {
        category: 'processing',
        priority: 'medium'
      }
    }]);
    
    setIsProcessing(true);
    aiMutation.mutate(userInput);
    setInput('');
  };

  // Voice command handler (future enhancement placeholder)
  const handleVoiceCommand = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast({
        title: "🎤 Voice Recording Started",
        description: "Speak your command clearly...",
      });
    } else {
      setIsRecording(false);
      toast({
        title: "🎤 Recording Stopped",
        description: "Processing your voice command...",
      });
    }
  };

  // Enhanced quick actions with categories
  const quickActionCategories = [
    {
      title: 'Business Intelligence',
      icon: TrendingUp,
      color: 'blue',
      actions: [
        { label: 'Platform Health Check', prompt: 'Analyze current platform health with real-time metrics and provide strategic recommendations', icon: Activity },
        { label: 'Revenue Optimization', prompt: 'Identify revenue optimization opportunities based on current performance data', icon: DollarSign },
        { label: 'Growth Predictions', prompt: 'Forecast growth potential and predict next quarter performance based on current trends', icon: Rocket },
        { label: 'Competitive Analysis', prompt: 'Research competitor strategies and market positioning for ReturnIt', icon: Target }
      ]
    },
    {
      title: 'Technical Operations',
      icon: Settings,
      color: 'purple',
      actions: [
        { label: 'Performance Audit', prompt: 'Conduct comprehensive performance audit of the platform and identify bottlenecks', icon: Monitor },
        { label: 'Security Assessment', prompt: 'Perform security vulnerability assessment and recommend improvements', icon: Shield },
        { label: 'Database Optimization', prompt: 'Analyze database performance and suggest optimization strategies', icon: Database },
        { label: 'Code Quality Review', prompt: 'Review codebase for quality issues and recommend improvements', icon: Code }
      ]
    },
    {
      title: 'User Experience',
      icon: Users,
      color: 'green',
      actions: [
        { label: 'User Journey Analysis', prompt: 'Analyze user behavior patterns and identify improvement opportunities', icon: Eye },
        { label: 'Conversion Optimization', prompt: 'Identify and fix conversion bottlenecks in the user flow', icon: Target },
        { label: 'Customer Satisfaction', prompt: 'Analyze customer feedback and satisfaction metrics with actionable insights', icon: Heart },
        { label: 'Mobile Experience', prompt: 'Evaluate mobile user experience and suggest enhancements', icon: Globe }
      ]
    }
  ];

  const clearChat = () => {
    setMessages(messages.slice(0, 1)); // Keep welcome message
    if (persistHistory) {
      localStorage.removeItem('ai_assistant_history');
    }
    toast({
      title: "Chat Cleared",
      description: "Conversation history has been reset",
    });
  };

  const exportChat = () => {
    const chatData = {
      export_date: new Date().toISOString(),
      platform: 'ReturnIt',
      session_type: 'admin_ai_assistant',
      messages: messages.map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp,
        metadata: msg.metadata
      }))
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `returnit_ai_chat_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Chat Exported",
      description: "Conversation downloaded as JSON file",
    });
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={onClose} 
          className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl transition-all duration-300 hover:scale-110 animate-pulse"
        >
          <Sparkles className="h-7 w-7 text-white" />
        </Button>
        {platformMetrics && (
          <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 animate-bounce">
            {platformMetrics.activeUsers} users
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] z-50">
      <Card className="h-full shadow-2xl border border-green-400 bg-black text-green-400 font-mono">
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              AI Development Assistant
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm mt-2 text-purple-100">
            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span>{isProcessing ? 'Working on your request...' : 'Ready to help you build'}</span>
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col h-full p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  {message.type === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  {message.type === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto'
                        : message.status === 'error'
                        ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200'
                        : 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {message.status === 'thinking' ? (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 animate-spin text-purple-600" />
                          <span className="text-sm">Analyzing your request...</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          
                          {message.codeChanges && message.codeChanges.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <div className="text-xs font-medium text-purple-600 flex items-center gap-1">
                                <Code className="w-3 h-3" />
                                Code Changes Applied:
                              </div>
                              {message.codeChanges.map((change, index) => (
                                <div key={index} className="bg-white/60 border border-purple-200 rounded p-2 text-xs">
                                  <div className="font-medium text-purple-800">{change.file}</div>
                                  <div className="text-slate-600 mt-1">{change.description}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {message.databaseQueries && message.databaseQueries.length > 0 && (
                            <div className="mt-2 text-xs bg-yellow-50 border border-yellow-200 rounded p-2">
                              <div className="font-medium text-yellow-800 flex items-center gap-1">
                                <Database className="w-3 h-3" />
                                Database Operations: {message.databaseQueries.length}
                              </div>
                            </div>
                          )}
                          
                          {message.commandResults && message.commandResults.length > 0 && (
                            <div className="mt-2 text-xs bg-green-50 border border-green-200 rounded p-2">
                              <div className="font-medium text-green-800 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Commands Executed: {message.commandResults.length}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="text-xs opacity-70 mt-2 text-right">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 bg-white hover:bg-purple-50 border-purple-200 text-purple-700"
                    onClick={() => setInput(action.prompt)}
                    disabled={isProcessing}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tell me what you'd like to build or fix..."
                  disabled={isProcessing}
                  className="flex-1 border-slate-300 focus:border-purple-400 focus:ring-purple-400"
                />
                <Button 
                  type="submit" 
                  disabled={isProcessing || !input.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {isProcessing ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}