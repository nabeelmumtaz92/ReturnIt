# ReturnIt AI Terminal - Standalone App

A powerful terminal-style AI interface that can be extracted and deployed as a standalone application.

## Features

🖥️ **Terminal Interface** - Authentic command-line aesthetics with green-on-black terminal styling
🤖 **AI Integration** - GPT-5 powered assistant with advanced command processing
📊 **Real-time Metrics** - Live platform monitoring and business intelligence
📝 **Command History** - Full command history with up/down arrow navigation
🎯 **Built-in Commands** - System commands like `status`, `help`, `clear`, `exit`
⚡ **High Performance** - Optimized for fast responses and real-time updates

## Quick Start

### Running in Current Project

The terminal AI is already integrated into the admin dashboard. Access it by:

1. Login as admin user
2. Navigate to admin dashboard  
3. Click the terminal icon to open the AI terminal
4. Type `help` to see available commands

### Extracting as Standalone App

To extract this as a completely separate application:

1. **Copy Required Files:**
   ```bash
   # Core component files
   cp client/src/components/TerminalAI.tsx ./standalone-app/src/
   cp client/src/standalone/TerminalApp.tsx ./standalone-app/src/
   
   # UI Components (copy entire directories)
   cp -r client/src/components/ui ./standalone-app/src/components/
   cp -r client/src/hooks ./standalone-app/src/
   cp -r client/src/lib ./standalone-app/src/
   ```

2. **Setup Package:**
   ```bash
   cp client/src/standalone/package.json ./standalone-app/
   cd standalone-app
   npm install
   ```

3. **Configure API:**
   ```typescript
   // Update API endpoints in TerminalApp.tsx
   const API_BASE_URL = 'https://your-api-server.com';
   ```

4. **Build & Deploy:**
   ```bash
   npm run build
   npm run preview  # Test locally
   ```

## Architecture

### Component Structure
```
TerminalAI.tsx          # Main terminal interface component
├── Terminal UI         # Command-line styled interface
├── Message System      # User/AI/System message handling
├── Command Processor   # Built-in and AI command routing
├── Real-time Metrics   # Live platform data integration
└── Export Config       # Standalone app configuration
```

### API Integration
- **AI Assistant:** `/api/ai/assistant` - GPT-5 powered responses
- **Platform Metrics:** `/api/analytics/platform-metrics` - Real-time data
- **Authentication:** `/api/auth/me` - User session management

### Terminal Commands

**Built-in Commands:**
- `help` - Show command reference
- `status` - Platform health and metrics  
- `clear` - Clear terminal history
- `exit` - Close terminal

**AI Commands:**
- `> analyze platform performance`
- `> show user statistics` 
- `> generate business report`
- `> check system security`

## Customization

### Styling
The terminal uses CSS classes for easy theming:
```css
.terminal-container { background: black; color: #00ff00; }
.terminal-prompt { color: #00aa00; }
.terminal-user { color: white; }
.terminal-error { color: #ff4444; }
```

### API Configuration
Update the API endpoints in `TerminalApp.tsx`:
```typescript
const apiEndpoints = {
  ai: '/api/ai/assistant',
  metrics: '/api/analytics/platform-metrics',
  auth: '/api/auth/me'
};
```

### Commands
Add custom commands in `TerminalAI.tsx`:
```typescript
const processCommand = (cmd: string) => {
  switch (cmd.toLowerCase()) {
    case 'custom-command':
      addSystemMessage('Custom command executed');
      return;
    // ... existing commands
  }
};
```

## Deployment Options

### Standalone Web App
Deploy as a single-page application using Vercel, Netlify, or any static hosting:

```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

### Electron Desktop App
Wrap in Electron for desktop deployment:

```bash
npm install -D electron
# Configure Electron main process
npm run electron-build
```

### Docker Container
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Environment Variables

```env
VITE_API_URL=https://api.returnit.online
VITE_OPENAI_API_KEY=your-openai-key
VITE_APP_NAME=ReturnIt AI Terminal
```

## File Structure for Extraction

```
standalone-app/
├── src/
│   ├── TerminalApp.tsx      # Main app component
│   ├── TerminalAI.tsx       # Terminal interface
│   ├── components/ui/       # Shadcn components
│   ├── hooks/               # React hooks
│   └── lib/                 # Utility functions
├── package.json             # Dependencies
├── vite.config.ts          # Build configuration
├── tailwind.config.js      # Styling configuration
└── README.md               # This file
```

## License

MIT License - Feel free to modify and distribute as needed.

## Support

For technical support or questions about the terminal AI:
- Open an issue in the main repository
- Contact: support@returnit.online
- Documentation: https://docs.returnit.online/ai-terminal