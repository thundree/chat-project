# TTInteractive Chat Project

A modern, feature-rich chat application built with React, TypeScript, and Vite that supports multiple AI providers and enables rich conversational experiences with AI characters.

## 🚀 Features

### Multi-Provider AI Support
- **OpenAI** - GPT models (gpt-3.5-turbo, gpt-4, gpt-4o)
- **Google AI** - Gemini models (gemini-1.5-flash, gemini-1.5-pro)
- **OpenRouter** - Access to 200+ models from multiple providers
- **Ollama** - Local AI models for privacy-focused inference

### Chat Management
- Create and manage multiple conversations
- Character-based chat experiences
- Message editing and deletion
- Chat export/import functionality
- Real-time streaming responses
- Search across all chats and messages

### User Experience
- Dark/light theme support
- Responsive design for all devices
- Configurable temperature settings
- API key management with secure storage
- Model tier indicators (Free/Pro/Premium)
- Cache-optimized model loading

### Data Persistence
- **IndexedDB** for chat data and messages (via Dexie)
- **localStorage** for user preferences and settings
- Automatic data migration from legacy storage
- Export/import for backup and sharing

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite 6
- **AI SDKs**: OpenAI SDK, Google AI SDK (@google/genai)
- **Database**: IndexedDB with Dexie
- **UI Components**: Flowbite React, React Icons
- **Deployment**: GitHub Pages

## 📦 Installation

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

## 🔧 Configuration

### API Keys Setup

The application provides an in-app configuration interface for managing API keys:

1. **OpenAI**: Get your key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Google AI**: Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. **OpenRouter**: Get your key from [OpenRouter](https://openrouter.ai/keys)
4. **Ollama**: Install locally from [ollama.ai](https://ollama.ai)

All API keys are securely stored in your browser's IndexedDB and never leave your device.

### Environment Variables

No environment variables are required. All configuration is handled through the application interface.

## 🚀 Deployment

### GitHub Pages (Automated)
```bash
npm run build-n-deploy
```

### Manual Build
```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📚 Project Structure

```
src/
├── components/          # React components
│   ├── ChatConfiguration.tsx  # API key and model configuration
│   ├── ChatPanel.tsx          # Main chat interface
│   ├── MessageInput.tsx       # Message input component
│   └── ...
├── contexts/           # React context providers
│   ├── ChatContext.tsx       # Chat state management
│   └── useChat.ts            # Chat context hook
├── hooks/              # Custom React hooks
│   ├── useAI.ts              # Unified AI provider hook
│   ├── useDatabase.ts        # Database operations
│   └── ...
├── services/           # AI provider services
│   ├── aiService.ts          # Unified AI service
│   ├── openaiService.ts      # OpenAI integration
│   ├── googleAIService.ts    # Google AI integration
│   ├── openrouterService.ts  # OpenRouter integration
│   ├── ollamaService.ts      # Ollama integration
│   └── databaseService.ts    # IndexedDB operations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── constants/          # Application constants
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages

### Code Quality

The project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Tailwind CSS** for styling
- **Strict mode** React components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [https://thundree.github.io/chat-project/](https://thundree.github.io/chat-project/)
- **Issues**: [GitHub Issues](https://github.com/thundree/chat-project/issues)
- **Discussions**: [GitHub Discussions](https://github.com/thundree/chat-project/discussions)

## 📖 Documentation

For detailed documentation on specific features:

- [🤖 AI Services Guide](./docs/AI_SERVICES.md) - Complete guide to AI provider setup and usage
- [💾 Database & Storage](./docs/DATABASE.md) - Data persistence and storage architecture  
- [🔧 Development Guide](./docs/DEVELOPMENT.md) - Setup, building, and contributing
- [📱 Chat Context API](./src/contexts/README.md) - Chat state management documentation

---

Built with ❤️ using React, TypeScript, and modern web technologies.
