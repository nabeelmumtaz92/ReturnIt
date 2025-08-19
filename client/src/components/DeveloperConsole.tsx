import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Send, 
  User, 
  Code, 
  Database, 
  FileText, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Minimize2,
  Maximize2,
  X,
  Cpu,
  Move,
  Monitor,
  MessageCircle,
  Loader2,
  Terminal
} from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'processing' | 'completed' | 'error';
  metadata?: {
    duration?: number;
    filesModified?: number;
    commandsExecuted?: number;
    databaseQueries?: number;
    codeChanges?: string[];
  };
  isTyping?: boolean;
}

interface DeveloperConsoleProps {
  onClose?: () => void;
  isMinimized?: boolean;
}

export default function DeveloperConsole({ onClose, isMinimized }: DeveloperConsoleProps) {
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const consoleRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your AI development assistant with full administrative access to the ReturnIt platform.\n\n🔧 **Development Capabilities**\n• Build new features and components\n• Fix bugs and troubleshoot issues\n• Optimize database queries and performance\n• Code analysis and architecture improvements\n\n🗄️ **Administrative Powers**\n• Delete user [email] - Remove users from system\n• List users - Show all platform users\n• Show orders [status] - Display order information\n• System stats - Get platform statistics\n• SQL query: [query] - Execute custom database queries\n\n📊 **Advanced Commands**\n• "Delete user test@example.com"\n• "Generate report on users" \n• "Performance analysis"\n• "Backup data"\n• "Bulk delete users inactive"\n• "SQL query: SELECT * FROM orders WHERE status = \'active\'"\n\nWhat would you like me to help you with today?',
      timestamp: new Date(),
      status: 'completed'
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const aiMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const startTime = Date.now();
      const response = await apiRequest('/console/ai', 'POST', { prompt });
      const duration = Date.now() - startTime;
      return { ...response, duration };
    },
    onSuccess: (data: any) => {
      setMessages(prev => prev.map(msg => 
        msg.id === 'processing' 
          ? {
              ...msg,
              id: Date.now().toString(),
              type: 'assistant',
              content: data.message || data.response || 'Task completed successfully',
              status: 'completed',
              isTyping: false,
              metadata: {
                duration: data.duration || 0,
                filesModified: data.codeChanges?.length || 0,
                commandsExecuted: data.commandResults?.length || 0,
                databaseQueries: data.databaseQueries?.length || 0,
                codeChanges: data.codeChanges?.map((c: any) => c.file) || []
              }
            }
          : msg
      ));
      
      if (data.codeChanges?.length > 0) {
        toast({
          title: "Code Changes Applied",
          description: `Modified ${data.codeChanges.length} file(s)`,
        });
      }
    },
    onError: (error: any) => {
      setMessages(prev => prev.map(msg => 
        msg.id === 'processing' 
          ? {
              ...msg,
              id: Date.now().toString(),
              type: 'assistant',
              content: `I encountered an error: ${error.message || 'Request failed'}. Please try rephrasing your request or check if the service is available.`,
              status: 'error',
              isTyping: false
            }
          : msg
      ));
      
      toast({
        title: "Request Failed",
        description: error.message || 'An error occurred while processing your request',
        variant: "destructive",
      });
    }
  });

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
      status: 'completed'
    }]);

    // Add processing message
    setMessages(prev => [...prev, {
      id: 'processing',
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'processing',
      isTyping: true
    }]);

    setIsProcessing(true);
    aiMutation.mutate(userMessage);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, Math.min(window.innerWidth - 800, e.clientX - dragStart.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 500, e.clientY - dragStart.y));
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setIsProcessing(aiMutation.isPending);
  }, [aiMutation.isPending]);

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <Button 
          onClick={onClose}
          className="bg-slate-700 hover:bg-slate-800 text-white rounded-lg px-3 py-2 shadow-lg"
          data-testid="button-restore-console"
        >
          <Terminal className="w-4 h-4 mr-2" />
          Console
        </Button>
      </div>
    );
  }

  return (
    <Card 
      ref={consoleRef}
      className={`fixed w-[800px] h-[500px] shadow-2xl border-slate-300 z-40 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s ease-out'
      }}
      onMouseDown={handleMouseDown}
    >
      <CardHeader 
        className="pb-3 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white border-b border-slate-600 cursor-grab active:cursor-grabbing"
        data-drag-handle
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="relative">
              <Monitor className="w-6 h-6 text-emerald-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-bold">
              AI Development Chat
            </span>
            <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white border-emerald-400 shadow-lg">
              <Cpu className="w-3 h-3 mr-1 animate-pulse" />
              AI Powered
            </Badge>
            <div className="flex gap-1 ml-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-slate-400" />
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-300 hover:bg-slate-600 hover:text-white transition-all duration-200"
                data-testid="button-minimize-console"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-200"
                data-testid="button-close-console"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col h-full p-0 bg-gradient-to-b from-slate-900 via-black to-slate-900 text-emerald-400 font-mono border-t border-slate-600">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <div className={`flex items-start gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
                  {message.type === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`flex-1 min-w-0 max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-500">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      
                      {message.metadata && (
                        <div className="flex items-center gap-2 text-xs">
                          {message.metadata.duration && message.metadata.duration > 0 && (
                            <Badge variant="outline" className="text-xs bg-slate-800 text-slate-300">
                              <Clock className="w-3 h-3 mr-1" />
                              {message.metadata.duration}ms
                            </Badge>
                          )}
                          {message.metadata.filesModified! > 0 && (
                            <Badge variant="outline" className="text-xs bg-blue-900 text-blue-300">
                              <FileText className="w-3 h-3 mr-1" />
                              {message.metadata.filesModified} files
                            </Badge>
                          )}
                          {message.metadata.databaseQueries! > 0 && (
                            <Badge variant="outline" className="text-xs bg-yellow-900 text-yellow-300">
                              <Database className="w-3 h-3 mr-1" />
                              {message.metadata.databaseQueries} queries
                            </Badge>
                          )}
                          {message.metadata.commandsExecuted! > 0 && (
                            <Badge variant="outline" className="text-xs bg-green-900 text-green-300">
                              <Play className="w-3 h-3 mr-1" />
                              {message.metadata.commandsExecuted} commands
                            </Badge>
                          )}
                          {message.metadata.codeChanges && message.metadata.codeChanges.length > 0 && (
                            <Badge variant="outline" className="text-xs bg-purple-900 text-purple-300">
                              <Code className="w-3 h-3 mr-1" />
                              {message.metadata.codeChanges.length} files changed
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto'
                        : message.status === 'error'
                        ? 'bg-gradient-to-r from-red-900 to-red-800 text-red-100 border border-red-600'
                        : 'bg-gradient-to-r from-slate-800 to-slate-700 text-slate-100 border border-slate-600'
                    }`}>
                      {message.isTyping ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      ) : (
                        <div className="prose prose-sm max-w-none text-inherit">
                          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                            {message.content}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-600 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
          <div className="flex gap-3 items-end">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your ReturnIt project... (e.g., 'add a dark mode toggle', 'fix the login bug', 'optimize the database')"
              className="flex-1 bg-gradient-to-r from-slate-900 to-black border-slate-600 text-slate-100 placeholder-slate-400 focus:border-purple-400 focus:ring-purple-400 transition-all duration-200 rounded-lg"
              data-testid="input-console-command"
              disabled={isProcessing}
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg transition-all duration-200 rounded-lg px-4"
              data-testid="button-execute-console"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
            <span>Message your AI development assistant • Press Enter to send</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className={`font-semibold ${isProcessing ? 'text-yellow-400' : 'text-green-400'}`}>
                {isProcessing ? 'AI Working...' : 'AI Ready'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}