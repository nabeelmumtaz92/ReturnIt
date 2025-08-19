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
  Terminal, 
  Send, 
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
  Cpu
} from "lucide-react";

interface ConsoleEntry {
  id: string;
  type: 'command' | 'output' | 'error' | 'ai-response';
  content: string;
  timestamp: Date;
  metadata?: {
    duration?: number;
    filesModified?: number;
    commandsExecuted?: number;
    databaseQueries?: number;
  };
}

interface DeveloperConsoleProps {
  onClose?: () => void;
  isMinimized?: boolean;
}

export default function DeveloperConsole({ onClose, isMinimized }: DeveloperConsoleProps) {
  const [entries, setEntries] = useState<ConsoleEntry[]>([
    {
      id: '1',
      type: 'ai-response',
      content: 'Developer Console Initialized\n\nAI Assistant ready for development tasks:\n• Full codebase access and modification\n• Database operations and queries\n• System command execution\n• Real-time debugging and analysis\n\nType your development request or use AI commands...',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const aiMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const startTime = Date.now();
      const response = await apiRequest('/api/ai/assistant', 'POST', { prompt });
      const duration = Date.now() - startTime;
      return { ...response, duration };
    },
    onSuccess: (data: any) => {
      setEntries(prev => [...prev, {
        id: Date.now().toString(),
        type: 'ai-response',
        content: data.message,
        timestamp: new Date(),
        metadata: {
          duration: data.duration,
          filesModified: data.codeChanges?.length || 0,
          databaseQueries: data.databaseQueries?.length || 0,
          commandsExecuted: data.commandResults?.length || 0
        }
      }]);
      
      // Show individual operation results
      if (data.codeChanges?.length > 0) {
        data.codeChanges.forEach((change: any) => {
          setEntries(prev => [...prev, {
            id: `${Date.now()}-${Math.random()}`,
            type: 'output',
            content: `✓ Modified: ${change.file}\n  ${change.description}`,
            timestamp: new Date()
          }]);
        });
      }
      
      if (data.commandResults?.length > 0) {
        data.commandResults.forEach((cmd: any) => {
          setEntries(prev => [...prev, {
            id: `${Date.now()}-${Math.random()}`,
            type: 'output',
            content: `$ ${cmd.command}\n${cmd.output}`,
            timestamp: new Date()
          }]);
        });
      }
    },
    onError: (error: any) => {
      setEntries(prev => [...prev, {
        id: Date.now().toString(),
        type: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      }]);
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;

    // Add command to entries
    setEntries(prev => [...prev, {
      id: Date.now().toString(),
      type: 'command',
      content: input,
      timestamp: new Date()
    }]);

    // Update command history
    setCommandHistory(prev => [input, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);

    // Process AI request
    aiMutation.mutate(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [entries]);

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
    <Card className="fixed bottom-4 left-4 w-[800px] h-[500px] shadow-2xl border-slate-200 z-40 bg-slate-50">
      <CardHeader className="pb-3 bg-slate-800 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Developer Console
            <Badge variant="secondary" className="ml-2 bg-green-600 text-white">
              <Cpu className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-slate-700"
              data-testid="button-minimize-console"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-slate-700"
              data-testid="button-close-console"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col h-full p-0 bg-slate-900 text-green-400 font-mono">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="group">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {entry.type === 'command' && <Terminal className="w-4 h-4 text-blue-400" />}
                    {entry.type === 'output' && <CheckCircle className="w-4 h-4 text-green-400" />}
                    {entry.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    {entry.type === 'ai-response' && <Cpu className="w-4 h-4 text-purple-400" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-500">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                      
                      {entry.metadata && (
                        <div className="flex items-center gap-2 text-xs">
                          {entry.metadata.duration && (
                            <Badge variant="outline" className="text-xs bg-slate-800 text-slate-300">
                              <Clock className="w-3 h-3 mr-1" />
                              {entry.metadata.duration}ms
                            </Badge>
                          )}
                          {entry.metadata.filesModified! > 0 && (
                            <Badge variant="outline" className="text-xs bg-blue-900 text-blue-300">
                              <FileText className="w-3 h-3 mr-1" />
                              {entry.metadata.filesModified} files
                            </Badge>
                          )}
                          {entry.metadata.databaseQueries! > 0 && (
                            <Badge variant="outline" className="text-xs bg-yellow-900 text-yellow-300">
                              <Database className="w-3 h-3 mr-1" />
                              {entry.metadata.databaseQueries} queries
                            </Badge>
                          )}
                          {entry.metadata.commandsExecuted! > 0 && (
                            <Badge variant="outline" className="text-xs bg-green-900 text-green-300">
                              <Play className="w-3 h-3 mr-1" />
                              {entry.metadata.commandsExecuted} commands
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <pre className={`whitespace-pre-wrap text-sm leading-relaxed ${
                      entry.type === 'command' ? 'text-blue-300' :
                      entry.type === 'error' ? 'text-red-300' :
                      entry.type === 'ai-response' ? 'text-purple-300' :
                      'text-green-300'
                    }`}>
                      {entry.type === 'command' && '$ '}
                      {entry.content}
                    </pre>
                  </div>
                </div>
                
                {entry !== entries[entries.length - 1] && (
                  <Separator className="mt-3 bg-slate-700" />
                )}
              </div>
            ))}
            
            {aiMutation.isPending && (
              <div className="flex items-center gap-3 text-yellow-400">
                <Clock className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI processing request...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex gap-2">
            <div className="flex items-center text-blue-400 mr-2">
              <Terminal className="w-4 h-4 mr-1" />
              <span className="text-sm">AI&gt;</span>
            </div>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter AI development command (e.g., 'add dark mode toggle', 'fix login bug', 'optimize database')"
              className="flex-1 bg-slate-900 border-slate-600 text-green-400 placeholder-slate-500"
              data-testid="input-console-command"
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || aiMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-execute-console"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span>Use ↑/↓ for command history • Enter to execute • Shift+Enter for new line</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>AI Assistant Active</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}