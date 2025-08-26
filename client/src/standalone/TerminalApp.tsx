import React from 'react';
import TerminalAI from '@/components/TerminalAI';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

// Standalone configuration for the Terminal AI app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface TerminalAppProps {
  apiUrl?: string;
  standalone?: boolean;
}

/**
 * Standalone Terminal AI Application
 * 
 * This component can be extracted and used as a separate application.
 * It includes all necessary providers and configurations.
 * 
 * Features:
 * - Complete terminal interface
 * - AI command processing  
 * - Real-time platform metrics
 * - Command history
 * - Built-in help system
 * - Modular architecture
 * 
 * Usage as standalone app:
 * 1. Copy this file and TerminalAI.tsx
 * 2. Install required dependencies
 * 3. Configure API endpoints
 * 4. Update styling/theming as needed
 */
export default function TerminalApp({ apiUrl, standalone = true }: TerminalAppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-screen h-screen bg-black">
        <TerminalAI 
          standalone={standalone}
          onClose={() => {
            if (standalone) {
              window.close();
            }
          }}
        />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

// Export configuration for easy setup
export const TerminalAppConfig = {
  name: 'ReturnIt AI Terminal',
  version: '3.0.1',
  description: 'Standalone AI terminal interface for ReturnIt platform',
  
  // Required dependencies for standalone app
  dependencies: {
    react: '^18.0.0',
    '@tanstack/react-query': '^5.0.0',
    'lucide-react': '^0.400.0',
    'tailwindcss': '^3.4.0',
    '@radix-ui/react-scroll-area': '^1.0.5',
    '@radix-ui/react-toast': '^1.1.5',
  },
  
  // API endpoints needed
  apiEndpoints: {
    ai: '/api/ai/assistant',
    metrics: '/api/analytics/platform-metrics',
    auth: '/api/auth/me'
  },
  
  // Files to extract for standalone app
  extractFiles: [
    'client/src/standalone/TerminalApp.tsx',
    'client/src/components/TerminalAI.tsx',
    'client/src/components/ui/card.tsx',
    'client/src/components/ui/input.tsx',
    'client/src/components/ui/button.tsx',
    'client/src/components/ui/scroll-area.tsx',
    'client/src/components/ui/toaster.tsx',
    'client/src/hooks/use-toast.ts',
    'client/src/lib/queryClient.ts',
    'client/src/lib/utils.ts'
  ],
  
  // Environment variables needed
  environment: {
    VITE_API_URL: 'https://api.returnit.online',
    VITE_OPENAI_API_KEY: 'your-openai-key'
  },
  
  // Build configuration
  build: {
    entry: 'src/standalone/TerminalApp.tsx',
    output: 'dist/terminal-ai',
    publicPath: '/',
    title: 'ReturnIt AI Terminal'
  }
};