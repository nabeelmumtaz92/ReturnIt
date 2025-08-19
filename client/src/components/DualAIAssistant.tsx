import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, Code, Zap, AlertTriangle, CheckCircle, Clock, X, Brain, Cpu } from "lucide-react";

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  source: 'embedded' | 'replit';
  status?: 'thinking' | 'executing' | 'completed' | 'error';
  codeChanges?: any[];
}

interface DualAIAssistantProps {
  onClose?: () => void;
  isMinimized?: boolean;
}

export default function DualAIAssistant({ onClose, isMinimized }: DualAIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Welcome to your Dual AI Development Environment!\n\n🤖 **Embedded AI**: Your built-in assistant with full codebase access\n🧠 **Development AI**: Advanced assistant with comprehensive tooling\n\nBoth assistants work on the same codebase and can see each other\'s changes in real-time. Try asking either one to help with your ReturnIt platform!',
      timestamp: new Date(),
      source: 'embedded'
    }
  ]);
  const [input, setInput] = useState('');
  const [activeAssistant, setActiveAssistant] = useState<'embedded' | 'replit'>('embedded');
  const { toast } = useToast();

  const embeddedAIMutation = useMutation({
    mutationFn: async (prompt: string) => {
      return apiRequest('/api/ai/assistant', 'POST', { prompt });
    },
    onSuccess: (data: any) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.message,
        timestamp: new Date(),
        source: 'embedded',
        status: 'completed',
        codeChanges: data.codeChanges
      }]);
      
      if (data.codeChanges?.length > 0) {
        toast({
          title: "Embedded AI - Changes Applied",
          description: `Updated ${data.codeChanges.length} file(s)`,
        });
      }
    },
    onError: (error: any) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
        source: 'embedded',
        status: 'error'
      }]);
    }
  });

  const replitAIMutation = useMutation({
    mutationFn: async (prompt: string) => {
      // This would connect to Replit's AI if API was available
      // For now, we'll simulate it with enhanced responses
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            message: `🧠 Development AI Response:\n\nI understand you want: "${prompt}"\n\nAs your advanced development assistant, I would:\n1. Analyze your entire codebase structure\n2. Check for dependencies and conflicts\n3. Implement the change with proper testing\n4. Validate the solution across your stack\n\nNote: This simulates what a full Replit AI integration would provide. Your embedded AI can already perform these actions!`,
            analysisComplete: true
          });
        }, 2000);
      });
    },
    onSuccess: (data: any) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.message,
        timestamp: new Date(),
        source: 'replit',
        status: 'completed'
      }]);
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
      source: activeAssistant
    }]);

    // Send to appropriate AI
    if (activeAssistant === 'embedded') {
      embeddedAIMutation.mutate(input);
    } else {
      replitAIMutation.mutate(input);
    }

    setInput('');
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={onClose}
          className="bg-amber-600 hover:bg-amber-700 text-white rounded-full w-12 h-12 shadow-lg"
          data-testid="button-restore-dual-ai"
        >
          <div className="flex">
            <Bot className="w-4 h-4 mr-1" />
            <Brain className="w-4 h-4" />
          </div>
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] shadow-2xl border-amber-200 z-50">
      <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <div className="flex">
              <Bot className="w-5 h-5" />
              <Brain className="w-5 h-5 ml-1" />
            </div>
            Dual AI Assistants
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="button-close-dual-ai"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <Tabs value={activeAssistant} onValueChange={(v) => setActiveAssistant(v as 'embedded' | 'replit')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="embedded" className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              Embedded AI
            </TabsTrigger>
            <TabsTrigger value="replit" className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              Dev AI
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="flex flex-col h-full p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-amber-600 text-white'
                    : message.source === 'embedded'
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-purple-50 border border-purple-200'
                }`}>
                  {message.type === 'assistant' && (
                    <Badge 
                      variant={message.source === 'embedded' ? 'secondary' : 'outline'}
                      className="mb-2 text-xs"
                    >
                      {message.source === 'embedded' ? (
                        <>
                          <Cpu className="w-3 h-3 mr-1" />
                          Embedded AI
                        </>
                      ) : (
                        <>
                          <Brain className="w-3 h-3 mr-1" />
                          Development AI
                        </>
                      )}
                    </Badge>
                  )}
                  
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  
                  {message.status === 'thinking' && (
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                      <Clock className="w-3 h-3 animate-spin" />
                      Thinking...
                    </div>
                  )}
                  
                  {message.codeChanges && message.codeChanges.length > 0 && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                      <Code className="w-3 h-3 inline mr-1" />
                      Applied {message.codeChanges.length} code change(s)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${activeAssistant === 'embedded' ? 'Embedded AI' : 'Development AI'} to help...`}
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              data-testid="textarea-dual-ai-input"
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || embeddedAIMutation.isPending || replitAIMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
              data-testid="button-send-dual-ai"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Active: {activeAssistant === 'embedded' ? 'Embedded AI' : 'Development AI'}</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Both AIs share the same codebase
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}