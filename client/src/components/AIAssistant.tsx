import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, Code, Zap, AlertTriangle, CheckCircle, Clock, X, Database } from "lucide-react";

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'thinking' | 'executing' | 'completed' | 'error';
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
}

interface AIAssistantProps {
  onClose?: () => void;
  isMinimized?: boolean;
}

export default function AIAssistant({ onClose, isMinimized }: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your AI assistant with full administrative access to the ReturnIt platform.\n\n🔧 **Development Tasks**\n• Building new features and components\n• Fixing bugs and troubleshooting issues\n• Code analysis and improvements\n\n🗄️ **Database & User Management**\n• Create, update, or delete users\n• Manage orders and update statuses\n• Execute custom SQL queries\n• System statistics and analytics\n\n📊 **Administrative Operations**\n• Recent activity monitoring\n• Platform performance diagnostics\n• User and order management\n• Real-time system monitoring\n\n**Command Examples:**\n• "Delete user john@example.com"\n• "Generate report on orders"\n• "Performance analysis" \n• "Backup data"\n• "Bulk delete users inactive"\n• "SQL query: SELECT COUNT(*) FROM users"\n\nWhat would you like me to help you with?',
      timestamp: new Date(),
      status: 'completed'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const aiMutation = useMutation({
    mutationFn: async (prompt: string) => {
      return apiRequest('/api/ai/assistant', 'POST', { prompt });
    },
    onSuccess: (data: any) => {
      setMessages(prev => prev.map(msg => 
        msg.status === 'thinking' 
          ? {
              ...msg,
              content: data.message || 'Task completed successfully!',
              status: 'completed',
              codeChanges: data.codeChanges,
              databaseQueries: data.databaseQueries,
              commandResults: data.commandResults
            }
          : msg
      ));
      
      if (data.codeChanges?.length > 0) {
        toast({
          title: "Code Changes Applied",
          description: `Successfully updated ${data.codeChanges.length} file(s)`,
        });
      }
      
      if (data.databaseQueries?.length > 0) {
        toast({
          title: "Database Operations",
          description: `Executed ${data.databaseQueries.length} database query(s)`,
        });
      }
      
      if (data.commandResults?.length > 0) {
        toast({
          title: "Commands Executed",
          description: `Successfully ran ${data.commandResults.length} system command(s)`,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userInput = input.trim();

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    }]);
    
    // Add thinking message
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'thinking'
    }]);
    
    setIsProcessing(true);
    aiMutation.mutate(userInput);
    setInput('');
  };

  const quickActions = [
    { label: 'System Stats', prompt: 'Show me system statistics and dashboard data' },
    { label: 'Generate Report', prompt: 'Generate report on users' },
    { label: 'Performance Analysis', prompt: 'Analyze system performance and metrics' },
    { label: 'Recent Activity', prompt: 'Show recent activity and platform usage' }
  ];

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={onClose} 
          className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] z-50">
      <Card className="h-full shadow-2xl border-2 border-purple-200 bg-gradient-to-b from-white to-slate-50">
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