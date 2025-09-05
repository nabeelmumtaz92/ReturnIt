import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, Zap, BarChart3, Users, MessageSquare } from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: string;
  data?: any;
}

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant for ReturnIt. I can help you with business insights, customer analysis, platform questions, and more. What would you like to know?',
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const aiMutation = useMutation({
    mutationFn: async (data: { prompt: string; action?: string }) => {
      const response = await apiRequest('/api/ai/openai-assistant', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response;
    },
    onSuccess: (response) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: response.message,
        timestamp: new Date(),
        action: response.action,
        data: response.data
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      console.error('AI Assistant error:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI assistant. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || aiMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    aiMutation.mutate({ prompt: input });
    setInput('');
  };

  const quickActions = [
    {
      title: "Business Insights",
      description: "Get platform analytics and performance metrics",
      icon: BarChart3,
      prompt: "Give me business insights and analytics for the ReturnIt platform"
    },
    {
      title: "Customer Analysis", 
      description: "Analyze customer behavior and trends",
      icon: Users,
      prompt: "Analyze our customer base and provide insights on user engagement"
    },
    {
      title: "Platform Help",
      description: "Get help with ReturnIt features and operations",
      icon: MessageSquare,
      prompt: "Help me understand ReturnIt's key features and how to optimize operations"
    }
  ];

  const handleQuickAction = (prompt: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    aiMutation.mutate({ prompt });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-amber-900">ReturnIt AI Assistant</h1>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              <Zap className="h-3 w-3" />
              GPT-5 Powered
            </div>
          </div>
          <p className="text-amber-700">Get intelligent insights and support for your delivery platform</p>
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-amber-200 hover:border-amber-300 bg-white/80 backdrop-blur-sm"
                onClick={() => handleQuickAction(action.prompt)}
                data-testid={`quick-action-${index}`}
              >
                <CardContent className="p-4 text-center space-y-3">
                  <div className="flex items-center justify-center">
                    <div className="p-2 bg-amber-100 rounded-full">
                      <action.icon className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900">{action.title}</h3>
                    <p className="text-sm text-amber-600 mt-1">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Chat Interface */}
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      message.type === 'user' 
                        ? 'bg-blue-100' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={`flex-1 max-w-lg ${
                      message.type === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      <div className={`p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white ml-auto'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Display data insights if available */}
                        {message.data && message.type === 'assistant' && (
                          <div className="mt-3 p-2 bg-amber-50 rounded border-l-4 border-amber-300">
                            <div className="text-xs text-amber-800 font-medium mb-1">Quick Stats:</div>
                            <div className="text-xs text-amber-700 space-y-1">
                              {message.data.customerCount !== undefined && (
                                <div>Customers: {message.data.customerCount}</div>
                              )}
                              {message.data.driverCount !== undefined && (
                                <div>Drivers: {message.data.driverCount}</div>
                              )}
                              {message.data.totalOrders !== undefined && (
                                <div>Total Orders: {message.data.totalOrders}</div>
                              )}
                              {message.data.totalRevenue !== undefined && (
                                <div>Revenue: ${message.data.totalRevenue?.toFixed(2)}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {aiMutation.isPending && (
                  <div className="flex gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="p-3 rounded-lg bg-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent"></div>
                          <span className="text-gray-600">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="border-t border-amber-200 p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about ReturnIt..."
                  className="flex-1 border-amber-200 focus:border-amber-400"
                  disabled={aiMutation.isPending}
                  data-testid="input-chat-message"
                />
                <Button 
                  type="submit" 
                  disabled={!input.trim() || aiMutation.isPending}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}