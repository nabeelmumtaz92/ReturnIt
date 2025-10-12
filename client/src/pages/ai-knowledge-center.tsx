import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Brain, Database, FileCode, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AIKnowledgeCenter() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const { toast } = useToast();

  // Fetch knowledge status
  const { data: knowledgeStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/ai/knowledge-status'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch file monitor status
  const { data: monitorStatus } = useQuery({
    queryKey: ['/api/ai/file-monitor-status'],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Refresh knowledge mutation
  const refreshMutation = useMutation({
    mutationFn: () => apiRequest('/api/ai/refresh-knowledge', 'POST', {}),
    onSuccess: () => {
      toast({
        title: "Knowledge Refreshed",
        description: "AI knowledge base has been updated with latest codebase info"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/knowledge-status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Refresh Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (message: string) => apiRequest('/console/ai', 'POST', { prompt: message }),
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSend = () => {
    if (!prompt.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    sendMutation.mutate(prompt);
    setPrompt("");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ReturnIt AI Assistant</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Powered by Gemini · Auto-updating knowledge</p>
            </div>
          </div>
          
          <Button
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            data-testid="button-refresh-knowledge"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh Knowledge
          </Button>
        </div>

        {/* Knowledge Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Knowledge Status */}
          <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-amber-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Database className="h-4 w-4 text-amber-600" />
                Knowledge Base
              </h3>
              {knowledgeStatus?.status?.isReady && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Data Models:</span>
                <span className="font-semibold text-gray-900 dark:text-white" data-testid="text-model-count">
                  {knowledgeStatus?.status?.modelCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">API Endpoints:</span>
                <span className="font-semibold text-gray-900 dark:text-white" data-testid="text-endpoint-count">
                  {knowledgeStatus?.status?.endpointCount || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                <span className="text-xs text-gray-500 dark:text-gray-400" data-testid="text-last-updated">
                  {knowledgeStatus?.status?.lastScanTime 
                    ? formatDate(knowledgeStatus.status.lastScanTime)
                    : 'Never'}
                </span>
              </div>
            </div>
          </Card>

          {/* File Monitor Status */}
          <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-amber-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileCode className="h-4 w-4 text-amber-600" />
                File Monitor
              </h3>
              {monitorStatus?.isActive ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Inactive
                </Badge>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Files Watched:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {monitorStatus?.filesWatched || 0}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {monitorStatus?.isActive 
                  ? 'Auto-updates when replit.md, schema.ts, or routes.ts changes'
                  : 'File monitoring is currently disabled'}
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-amber-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                Coverage
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Features:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {knowledgeStatus?.snapshot?.featureCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Integrations:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {knowledgeStatus?.snapshot?.integrationCount || 0}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Sources: {knowledgeStatus?.snapshot?.sources?.join(', ') || 'None'}
              </div>
            </div>
          </Card>
        </div>

        {/* Chat Interface */}
        <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-amber-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Chat with AI</h3>
          
          {/* Messages */}
          <div className="space-y-3 mb-4 h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Ask me anything about ReturnIt!</p>
                <p className="text-sm mt-1">I have current knowledge of your codebase</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}
                    data-testid={`message-${msg.role}-${idx}`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about users, orders, features, or make code changes..."
              className="min-h-[60px] resize-none"
              disabled={sendMutation.isPending}
              data-testid="input-ai-prompt"
            />
            <Button
              onClick={handleSend}
              disabled={sendMutation.isPending || !prompt.trim()}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              data-testid="button-send-message"
            >
              Send
            </Button>
          </div>
        </Card>

        {/* Knowledge Preview */}
        {knowledgeStatus?.snapshot && (
          <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-amber-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">What AI Knows</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Sample Data Models</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  {knowledgeStatus.snapshot.sampleModels?.map((model: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {model}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Sample API Endpoints</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400 font-mono text-xs">
                  {knowledgeStatus.snapshot.sampleEndpoints?.map((endpoint: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {endpoint}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
