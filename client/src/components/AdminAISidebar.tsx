import { useState, useEffect } from 'react';
import { Bot, X, RefreshCw, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface KnowledgeStatus {
  modelCount: number;
  endpointCount: number;
  lastUpdated: string;
}

export function AdminAISidebar() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { toast } = useToast();

  // Fetch knowledge status
  const { data: knowledgeStatus, refetch: refetchStatus } = useQuery<KnowledgeStatus>({
    queryKey: ['/api/ai/knowledge-status'],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('/console/ai', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        headers: { 'Content-Type': 'application/json' },
      });
      return response;
    },
    onSuccess: (data: any) => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.message || 'No response',
          timestamp: new Date()
        }
      ]);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    },
  });

  // Refresh knowledge mutation
  const refreshKnowledgeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/ai/knowledge/refresh', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      refetchStatus();
      toast({
        title: 'Knowledge Updated',
        description: 'AI knowledge base has been refreshed',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to refresh knowledge',
        variant: 'destructive',
      });
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background border-l">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-amber-600" />
          <h3 className="font-semibold text-sm">AI Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => refreshKnowledgeMutation.mutate()}
          disabled={refreshKnowledgeMutation.isPending}
          data-testid="button-refresh-knowledge"
        >
          <RefreshCw className={`h-4 w-4 ${refreshKnowledgeMutation.isPending ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Knowledge Status */}
      {knowledgeStatus && (
        <div className="px-4 py-2 bg-muted/50 border-b">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {knowledgeStatus.modelCount} models
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {knowledgeStatus.endpointCount} endpoints
            </Badge>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-2 text-amber-600/30" />
              <p>Ask me anything about the platform</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-amber-600 text-white'
                    : 'bg-muted'
                }`}
                data-testid={`message-${msg.role}-${idx}`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {sendMessageMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the platform..."
            className="min-h-[60px] resize-none text-sm"
            disabled={sendMessageMutation.isPending}
            data-testid="input-ai-message"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sendMessageMutation.isPending}
            size="icon"
            className="h-[60px] w-[60px] shrink-0"
            data-testid="button-send-message"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
