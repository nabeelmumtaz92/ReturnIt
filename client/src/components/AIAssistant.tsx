import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, Code, Zap, AlertTriangle, CheckCircle, Clock, X } from "lucide-react";

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
      content: 'Hello! I can help you make changes to your ReturnIt platform. Try commands like:\n\n• "Change the theme to dark mode"\n• "Make the website offline for maintenance"\n• "Add a new status filter for drivers"\n• "Update the booking form layout"\n\nWhat would you like me to help with?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const aiMutation = useMutation({
    mutationFn: async (prompt: string) => {
      return apiRequest('/api/ai/assistant', 'POST', { prompt });
    },
    onSuccess: (response) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
        status: 'completed',
        codeChanges: response.codeChanges
      }]);
      
      if (response.codeChanges?.length > 0) {
        toast({
          title: "Changes Applied",
          description: `Updated ${response.codeChanges.length} file(s) successfully`,
        });
      }
    },
    onError: (error: any) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
        status: 'error'
      }]);
      
      toast({
        title: "AI Assistant Error",
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

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Add thinking message
    const thinkingMessage: AIMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: 'Analyzing your request and generating code changes...',
      timestamp: new Date(),
      status: 'thinking'
    };
    
    setMessages(prev => [...prev, thinkingMessage]);
    setIsProcessing(true);
    aiMutation.mutate(input);
    setInput('');
  };

  const quickActions = [
    { label: 'Dark Mode', prompt: 'Change the website theme to dark mode' },
    { label: 'Maintenance Mode', prompt: 'Put the website in maintenance mode with a message' },
    { label: 'Secure Mode', prompt: 'Enable secure mode with enhanced authentication' },
    { label: 'Light Theme', prompt: 'Change back to light theme' }
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
      <Card className="h-full shadow-2xl border-2 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-blue-600" />
              AI Code Assistant
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  setInput(action.prompt);
                }}
                disabled={isProcessing}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col h-full p-4">
          <ScrollArea className="flex-1 mb-4 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === 'assistant' && (
                        <div className="mt-0.5">
                          {message.status === 'thinking' && <Clock className="h-3 w-3 animate-pulse" />}
                          {message.status === 'executing' && <Zap className="h-3 w-3 animate-bounce" />}
                          {message.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-600" />}
                          {message.status === 'error' && <AlertTriangle className="h-3 w-3 text-red-600" />}
                          {!message.status && <Bot className="h-3 w-3" />}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {message.codeChanges && message.codeChanges.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.codeChanges.map((change, index) => (
                              <div key={index} className="bg-white/10 rounded p-2 text-xs">
                                <div className="flex items-center gap-1 mb-1">
                                  <Code className="h-3 w-3" />
                                  <span className="font-medium">{change.file}</span>
                                </div>
                                <p className="text-xs opacity-90 mb-1">{change.description}</p>
                                <pre className="text-xs bg-black/20 rounded p-1 overflow-x-auto">
                                  {change.preview}
                                </pre>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me to change anything about the website..."
                disabled={isProcessing}
                className="flex-1"
              />
              <Button type="submit" disabled={isProcessing || !input.trim()}>
                {isProcessing ? (
                  <Clock className="h-4 w-4 animate-pulse" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {isProcessing && (
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <Clock className="h-3 w-3 animate-pulse" />
                Processing your request...
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}