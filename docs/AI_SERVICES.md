# 🤖 AI Services Guide

Welcome to the AI Services documentation! This guide will help you understand and configure the multiple AI providers supported by TTInteractive Chat.

## 🌟 Quick Start

1. **Choose your provider** - Pick from OpenAI, Google AI, OpenRouter, or local Ollama
2. **Get an API key** - Follow the setup links below for your chosen provider
3. **Configure in app** - Open any chat → Configuration tab → Enter your API key
4. **Start chatting** - Select your preferred model and start your conversation!

## 🔧 Supported Providers

### 🧠 OpenAI (GPT Models)
**Best for: High-quality responses, coding assistance**

- **Models**: GPT-3.5-turbo, GPT-4, GPT-4o, GPT-4o-mini
- **Features**: Excellent reasoning, creative writing, code generation
- **Get API Key**: [OpenAI Platform](https://platform.openai.com/api-keys)
- **Cost**: Pay-per-use, competitive pricing for quality

```typescript
// Popular models to try:
"gpt-3.5-turbo"  // Fast and cost-effective
"gpt-4o"         // Latest and most capable
"gpt-4o-mini"    // Balanced performance and cost
```

### 🎯 Google AI (Gemini)
**Best for: Fast responses, multimodal capabilities, generous free tier**

- **Models**: Gemini-1.5-flash, Gemini-1.5-pro, Gemini-2.0-flash-exp
- **Features**: Fast inference, great for conversation, excellent free tier
- **Get API Key**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Cost**: Generous free tier, then competitive pricing

```typescript
// Recommended models:
"gemini-2.5-flash"     // Super fast, free tier available
"gemini-2.5-pro"       // Higher quality, still affordable
```

### 🌐 OpenRouter (200+ Models)
**Best for: Model variety, competitive pricing, one API for everything**

- **Models**: 200+ models from OpenAI, Anthropic, Google, Meta, Mistral, and more
- **Features**: Best pricing, automatic fallbacks, huge model selection
- **Get API Key**: [OpenRouter](https://openrouter.ai/keys)
- **Cost**: Often cheaper than direct provider APIs

```typescript
// Popular choices through OpenRouter:
"openai/gpt-4o"                // OpenAI's flagship
"anthropic/claude-3.5-sonnet"      // Anthropic's best
"google/gemini-2.5-flash"      // Google's latest
"meta-llama/llama-3.1-8b-instruct" // Open source option
```

### 🏠 Ollama (Local/Private)
**Best for: Privacy, no API costs, offline usage**

- **Models**: Llama, Mistral, CodeLlama, Phi, and many more
- **Features**: Runs locally, completely private, no API costs
- **Setup**: Download from [ollama.ai](https://ollama.ai)
- **Cost**: Free! Just uses your local compute

```bash
# Install popular models:
ollama pull llama3.2
ollama pull mistral
ollama pull codellama
```

## 🚀 Getting Started

### Step 1: Choose Your Provider

**New to AI?** Start with **Google AI (Gemini)** - it has a generous free tier and is easy to set up.

**Want the best quality?** Try **OpenAI GPT-4** - industry-leading performance for complex tasks.

**Want variety and savings?** Go with **OpenRouter** - access to 200+ models with competitive pricing.

**Privacy-focused?** Use **Ollama** - everything runs locally on your machine.

### Step 2: Get Your API Key

Click the setup link for your chosen provider above and follow their instructions to get an API key.

### Step 3: Configure in TTInteractive

1. Open any chat in the application
2. Click on the **Configuration** tab
3. Find your provider's section
4. Enter your API key and click **Save**
5. Test your connection with the **Test API Connection** button

### Step 4: Select Your Model

1. In the Configuration tab, choose your **AI Provider**
2. Select your preferred **Model** from the dropdown
3. Adjust **Temperature** if desired (0.1 = focused, 0.9 = creative)
4. Start chatting!

## 💡 Pro Tips

### Model Selection
- **Fast responses**: Gemini-1.5-flash, GPT-3.5-turbo
- **High quality**: GPT-4o, Claude-3.5-sonnet, Gemini-1.5-pro
- **Cost-effective**: OpenRouter versions of popular models
- **Privacy**: Any Ollama model

### Temperature Settings
- **0.1-0.3**: Focused, consistent responses (good for factual questions)
- **0.4-0.7**: Balanced creativity and consistency (great for general chat)
- **0.8-1.0**: More creative and varied responses (fun for creative writing)

### Switching Providers
You can switch between providers anytime! The app remembers your API keys and preferred models for each provider.

## 🔧 Advanced Usage

### Using the Unified API

The app provides a unified interface for all providers:

```typescript
import { useAI } from "@/hooks/useAI";

function MyComponent() {
  const { 
    generateResponse,
    switchProvider,
    getAvailableModels,
    hasApiKey 
  } = useAI("openrouter");

  // Switch provider anytime
  await switchProvider("google");
  
  // Generate response
  const response = await generateResponse(chat, {
    model: "gemini-1.5-flash",
    maxTokens: 1000
  });
}
```

### Streaming Responses

All providers support real-time streaming for a better chat experience:

```typescript
await generateStreamingResponse(
  chat,
  (chunk) => {
    // Handle each chunk as it arrives
    console.log(chunk);
  },
  { model: "gpt-4o", maxTokens: 1000 }
);
```

## 🛠️ Troubleshooting

### "No API key found"
- Make sure you've entered your API key in the Configuration tab
- Click "Test API Connection" to verify it's working
- Check that you've selected the right provider

### "Connection failed"
- Verify your API key is correct
- Check your internet connection
- For Ollama: make sure the Ollama server is running locally

### Model not loading
- Wait a moment - models are cached for 24 hours for performance
- Try refreshing the model list in Configuration
- For OpenRouter: you can browse models without an API key

### Poor response quality
- Try a different model (GPT-4 vs GPT-3.5, etc.)
- Adjust the temperature setting
- Check if you're hitting rate limits

## 📊 Feature Comparison

| Feature | OpenAI | Google AI | OpenRouter | Ollama |
|---------|---------|-----------|------------|---------|
| **Setup Difficulty** | Easy | Easy | Easy | Medium |
| **Cost** | $$$ | $ (free tier) | $$ | Free |
| **Model Variety** | Good | Good | Excellent | Good |
| **Response Quality** | Excellent | Excellent | Varies | Good |
| **Privacy** | Cloud | Cloud | Cloud | Local |
| **Free Tier** | Limited | Generous | No | Unlimited |

## 🔒 Security & Privacy

- **API Keys**: Stored securely in your browser's IndexedDB, never transmitted to our servers
- **Messages**: All chat data stays on your device
- **Privacy**: For maximum privacy, use Ollama for completely local AI

## 🆘 Need Help?

- Check the [GitHub Issues](https://github.com/thundree/chat-project/issues) for common problems
- Join [GitHub Discussions](https://github.com/thundree/chat-project/discussions) for community support
- Read the [Database Guide](./DATABASE.md) for data-related questions

---

Happy chatting! 🎉 The AI providers are waiting to help you with whatever you need.
