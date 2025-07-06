# 🔧 Development Guide

Welcome to the TTInteractive development documentation! This guide will help you set up, build, and contribute to the project.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (recommend using latest LTS)
- **npm** or **yarn** package manager
- **Git** for version control
- **Modern browser** with IndexedDB support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/thundree/chat-project.git
   cd chat-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   ```
   http://localhost:5174
   ```

That's it! You should see the TTInteractive chat interface.

## 📁 Project Structure

```
TTInteractive Chat Project/
├── 📄 README.md                 # Project overview and quick start
├── 📄 LICENSE                   # MIT license
├── ⚙️ package.json              # Dependencies and scripts
├── ⚙️ vite.config.ts            # Vite build configuration
├── ⚙️ tsconfig.json             # TypeScript configuration
├── ⚙️ eslint.config.js          # Code linting rules
├── 🌐 index.html                # Entry HTML file
│
├── 📁 public/                   # Static assets
│   └── 🖼️ vite.svg              # Vite logo
│
├── 📁 src/                      # Source code
│   ├── 📄 main.tsx              # App entry point
│   ├── 🎨 index.css             # Global styles
│   ├── 📄 layout.tsx            # App layout component
│   ├── 📄 vite-env.d.ts         # Vite type definitions
│   │
│   ├── 📁 components/           # React components
│   │   ├── 💬 ChatPanel.tsx     # Main chat interface
│   │   ├── 💬 MessageList.tsx   # Message display
│   │   ├── 💬 MessageItem.tsx   # Individual message
│   │   ├── ✏️ MessageInput.tsx  # Message input field
│   │   ├── 🎭 CharacterSelect.tsx # Character selection
│   │   ├── ⚙️ ChatConfiguration.tsx # Settings panel
│   │   ├── 🔧 ApiKeyManager.tsx # API key management
│   │   └── 🧩 [other components] # Utility components
│   │
│   ├── 📁 contexts/             # React contexts
│   │   ├── 💬 ChatContext.tsx   # Chat state management
│   │   ├── 🔗 useChat.ts        # Chat context hook
│   │   └── 📄 README.md         # Context documentation
│   │
│   ├── 📁 hooks/                # Custom React hooks
│   │   ├── 🤖 useAI.ts          # Unified AI provider hook
│   │   ├── 💾 useDatabase.ts    # Database operations
│   │   ├── 🔑 useApiKeys.ts     # API key management
│   │   └── 🔗 useOpenAI.ts      # OpenAI specific hook
│   │
│   ├── 📁 services/             # External service integrations
│   │   ├── 🤖 aiService.ts      # Unified AI service
│   │   ├── 🧠 openaiService.ts  # OpenAI integration
│   │   ├── 🎯 googleAIService.ts # Google AI integration
│   │   ├── 🌐 openrouterService.ts # OpenRouter integration
│   │   ├── 🏠 ollamaService.ts  # Ollama integration
│   │   └── 💾 databaseService.ts # IndexedDB operations
│   │
│   ├── 📁 types/                # TypeScript type definitions
│   │   └── 📄 index.ts          # All app types
│   │
│   ├── 📁 utils/                # Utility functions
│   │   ├── 🔑 apiKeyUtils.ts    # API key validation
│   │   ├── 💾 databaseUtils.ts  # Database utilities
│   │   ├── 🌐 httpClient.ts     # HTTP request wrapper
│   │   └── 💾 localStorage.ts   # localStorage helpers
│   │
│   ├── 📁 constants/            # App constants
│   │   └── 📄 index.ts          # All constants
│   │
│   ├── 📁 functions/            # Helper functions
│   │   └── 📄 index.ts          # Utility functions
│   │
│   ├── 📁 data/                 # Static data
│   │   ├── 🎭 originalCharacters.ts # Default characters
│   │   └── 💬 mockedChats.ts    # Sample chat data
│   │
│   └── 📁 assets/               # Static assets
│       └── 🖼️ react.svg         # React logo
│
├── 📁 docs/                     # Documentation
│   ├── 🤖 AI_SERVICES.md       # AI provider guide
│   ├── 💾 DATABASE.md           # Database documentation
│   └── 🔧 DEVELOPMENT.md        # This file
│
└── 📁 .github/                  # GitHub configuration
    └── 📁 workflows/            # CI/CD workflows
        └── ⚙️ deploy.yml        # Auto-deployment
```

## 🛠️ Available Scripts

### Development
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint code quality checks
```

### Deployment
```bash
npm run build-n-deploy  # Build and deploy to GitHub Pages
npm run deploy          # Deploy current build to GitHub Pages
```

## 🏗️ Architecture

### Frontend Framework
- **React 19.1.0** - Modern React with concurrent features
- **TypeScript** - Full type safety throughout the application
- **Vite 6.3.5** - Fast build tool and development server
- **TailwindCSS 4.1.10** - Utility-first CSS framework

### UI Components
- **Flowbite React** - Pre-built components (buttons, modals, tabs)
- **React Icons** - Comprehensive icon library
- **Custom Components** - Tailored chat interface components

### State Management
- **React Context** - Chat state, messages, settings
- **Custom Hooks** - Reusable logic (useAI, useDatabase, useApiKeys)
- **Local State** - Component-specific state with useState/useEffect

### Data Persistence
- **IndexedDB** (via Dexie) - Primary storage for chats and messages
- **localStorage** - User preferences and UI state
- **Migration System** - Automatic data migration from legacy storage

### AI Integration
- **Unified Interface** - Single API for all AI providers
- **Multiple Providers** - OpenAI, Google AI, OpenRouter, Ollama
- **Streaming Support** - Real-time response streaming
- **Model Management** - Dynamic model loading and caching

## 🎯 Development Workflow

### Setting Up Development Environment

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure VS Code** (recommended)
   - Install TypeScript extension
   - Install ESLint extension
   - Install Tailwind CSS IntelliSense
   - Enable format on save

3. **Start development server**
   ```bash
   npm run dev
   ```

### Making Changes

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow TypeScript best practices
   - Use existing component patterns
   - Update types as needed

3. **Test your changes**
   ```bash
   npm run lint      # Check code quality
   npm run build     # Verify builds successfully
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

#### TypeScript
```typescript
// Use interfaces for object types
interface ChatMessage {
  id: string;
  sender: "user" | "character";
  text: string[];
  timestamp: Date;
}

// Use proper typing for functions
const addMessage = async (
  chatId: string, 
  message: Omit<Message, 'id'>
): Promise<string> => {
  // Implementation
};

// Use const assertions for constants
const AI_PROVIDERS = ['openai', 'google', 'openrouter', 'ollama'] as const;
type AIProvider = typeof AI_PROVIDERS[number];
```

#### React Components
```tsx
// Use function declarations for components
function ChatMessage({ message, onDelete }: ChatMessageProps) {
  // Component logic
  return <div>{/* JSX */}</div>;
}

// Define props interfaces
interface ChatMessageProps {
  message: Message;
  onDelete: (id: string) => void;
}

// Use proper imports
import React, { useState, useEffect } from 'react';
import type { Message } from '@/types';
```

#### CSS/Styling
```tsx
// Use Tailwind classes
<div className="flex flex-col space-y-4 p-6 bg-white dark:bg-gray-800">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
    Chat Title
  </h2>
</div>

// Support dark mode
<button className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
  Click me
</button>
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create new chat works
- [ ] Send messages and receive AI responses
- [ ] Switch between AI providers
- [ ] Configure API keys
- [ ] Delete messages and chats
- [ ] Export/import functionality
- [ ] Dark/light theme switching
- [ ] Responsive design on mobile

### Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox  
- [ ] Safari
- [ ] Edge

### Error Testing
- [ ] Invalid API keys
- [ ] Network disconnection
- [ ] Large message volumes
- [ ] Database errors

## 🐛 Debugging

### Common Issues

#### "Module not found" errors
```bash
# Check if dependencies are installed
npm install

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Restart TypeScript language server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

#### Build failures
```bash
# Clear Vite cache
rm -rf dist .vite

# Rebuild
npm run build
```

### Debug Tools

#### Browser DevTools
- **Console**: Check for JavaScript errors
- **Network**: Monitor API calls
- **Application**: Inspect IndexedDB and localStorage
- **Sources**: Set breakpoints in TypeScript code

#### TTInteractive Debug Commands
```javascript
// In browser console
window.ttInteractiveUtils.getDatabaseStats()
window.ttInteractiveUtils.exportAllData()
window.ttInteractiveUtils.validateDatabase()
```

#### React DevTools
Install React DevTools browser extension for:
- Component state inspection
- Context value debugging
- Performance profiling

## 🚀 Deployment

### GitHub Pages (Automatic)

The project auto-deploys to GitHub Pages on every push to main:

1. **Push to main branch**
   ```bash
   git push origin main
   ```

2. **GitHub Actions runs**
   - Installs dependencies
   - Runs build process
   - Deploys to gh-pages branch

3. **Site updates**
   - Usually takes 2-5 minutes
   - Available at: https://username.github.io/chat-project/

### Manual Deployment

```bash
# Build and deploy
npm run build-n-deploy

# Or build then deploy separately
npm run build
npm run deploy
```

### Custom Domain

To use a custom domain:

1. Add `CNAME` file to `public/` directory:
   ```
   your-domain.com
   ```

2. Configure DNS with your domain provider:
   ```
   CNAME your-domain.com username.github.io
   ```

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Clone your fork
3. Create feature branch
4. Make changes
5. Test thoroughly
6. Submit pull request

### What to Contribute
- 🐛 **Bug fixes** - Fix issues or improve error handling
- ✨ **New features** - Add chat features, AI providers, UI improvements
- 📚 **Documentation** - Improve guides, add examples
- 🎨 **UI/UX** - Design improvements, accessibility
- 🔧 **Performance** - Optimize loading, database, AI responses

### Pull Request Guidelines
- Clear description of changes
- Include screenshots for UI changes
- Add tests if applicable
- Update documentation
- Follow existing code style
- Keep changes focused and atomic

### Code Review Process
1. Automated checks (linting, building)
2. Manual code review
3. Testing by maintainers
4. Merge to main branch
5. Automatic deployment

## 📊 Performance Considerations

### Bundle Size
- Tree-shaking eliminates unused code
- Lazy loading for large components
- Dynamic imports for AI services
- Vite optimizes dependencies

### Runtime Performance
- React concurrent features
- Efficient re-rendering with proper deps
- Debounced database writes
- Cached API responses

### Database Performance
- Indexed queries for fast searches
- Batch operations for bulk changes
- Lazy loading of message history
- Automatic cleanup of old cache

## 🔒 Security Considerations

### API Key Security
- Client-side encryption before storage
- No transmission to external servers
- Secure IndexedDB storage
- Clear keys on logout

### Content Security
- Input sanitization
- XSS prevention
- CORS configuration
- Secure HTTP headers

### Privacy
- Local-only data storage
- No analytics or tracking
- Optional cloud sync (future feature)
- User data export/deletion

## 🆘 Getting Help

### Documentation
- **AI Services**: [AI_SERVICES.md](./AI_SERVICES.md)
- **Database**: [DATABASE.md](./DATABASE.md)
- **Chat Context**: [../src/contexts/README.md](../src/contexts/README.md)

### Community
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share ideas
- **Code Review**: Get feedback on contributions

### Troubleshooting
1. Check the console for errors
2. Verify your Node.js version (18+)
3. Clear browser cache and data
4. Try incognito/private browsing
5. Check GitHub Issues for known problems

---

Happy coding! 🎉 We're excited to see what you'll build with TTInteractive.
