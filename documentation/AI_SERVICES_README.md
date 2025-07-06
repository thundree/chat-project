# AI Services Integration

This project now supports OpenAI, Google AI (Gemini), Ollama, and OpenRouter APIs through a unified interface.

## Setup

API keys for all AI providers are stored in the application's database. You can configure and manage your API keys within the chat settings for a selected chat.

**Getting API Keys:**
- OpenAI: https://platform.openai.com/api-keys
- Google AI: https://aistudio.google.com/app/apikey
- OpenRouter: https://openrouter.ai/keys
- Ollama: Install locally from https://ollama.ai

**Note**: This project uses the latest `@google/genai` package (v1.6.0) instead of the deprecated `@google/generative-ai` package. The new package provides better performance and more recent API features.

## Usage

### Using the Unified AI Service

```typescript
import { useAI } from "@/hooks/useAI";

// In your component
const { 
  generateResponse, 
  switchProvider, 
  currentProvider,
  getAvailableModels 
} = useAI("openai"); // or "google-ai", "ollama", "openrouter"

// Switch between providers
switchProvider("openrouter");

// Generate a response
const message = await generateResponse(chat, {
  model: "openai/gpt-3.5-turbo", // OpenRouter model format
  maxTokens: 1000
});
```

### Direct Service Usage

```typescript
// OpenAI
import { OpenAIService } from "@/services/aiService";
const response = await OpenAIService.getChatCompletion(chat, "gpt-3.5-turbo");

// Google AI
import { GoogleAIService } from "@/services/aiService";
const response = await GoogleAIService.getChatCompletion(chat, "gemini-1.5-flash");

// OpenRouter
import { OpenRouterService } from "@/services/aiService";
const response = await OpenRouterService.getChatCompletion(chat, "openai/gpt-3.5-turbo");

// Ollama
import { OllamaService } from "@/services/aiService";
const response = await OllamaService.getChatCompletion(chat, "llama3.2");

// Unified Service
import { UnifiedAIService } from "@/services/aiService";
const aiService = new UnifiedAIService("openrouter");
const response = await aiService.getChatCompletion(chat, { model: "openai/gpt-3.5-turbo" });
```

## Available Models

### OpenAI Models (Direct)
- `gpt-3.5-turbo` (Recommended for most use cases)
- `gpt-4` (Premium model)
- `gpt-4-turbo-preview` (Latest GPT-4 variant)

### Google AI Models (Direct)
- `gemini-1.5-flash` (Fast and efficient, free tier)
- `gemini-1.5-flash-8b` (Smaller, faster version)
- `gemini-1.5-pro` (Most capable model)
- `gemini-1.0-pro` (Previous generation)

### Ollama Models (Local)
- `llama3.2` (Meta's latest Llama model)
- `llama3.1` (Previous Llama version)
- `mistral` (Mistral AI model)
- `codellama` (Code-specialized model)
- `phi3` (Microsoft's small model)

### OpenRouter Models (Multi-Provider Access)
OpenRouter provides access to hundreds of models from multiple providers:
- `openai/gpt-4o` (OpenAI's flagship model)
- `openai/gpt-4o-mini` (Smaller, faster GPT-4)
- `openai/gpt-3.5-turbo` (Cost-effective option)
- `anthropic/claude-3.5-sonnet` (Anthropic's latest)
- `anthropic/claude-3-haiku` (Fast and affordable)
- `google/gemini-2.0-flash-exp` (Google's experimental model)
- `meta-llama/llama-3.1-8b-instruct` (Meta's open model)
- `mistralai/mistral-7b-instruct` (Mistral's efficient model)
- And many more...

## Features

### Supported Operations
- ✅ Chat completion (single response)
- ✅ Streaming chat completion (real-time responses)
- ✅ API key validation
- ✅ Model listing
- ✅ Provider switching
- ✅ Message formatting
- ✅ Error handling

### Message Format Conversion
All services automatically handle message format conversion from your app's format to the respective API formats:

- **App format**: `{ sender: "user" | "character", text: string[] }`
- **OpenAI format**: `{ role: "user" | "assistant" | "system", content: string }`
- **Google AI format**: `{ role: "user" | "model", parts: [{ text: string }] }`
- **OpenRouter format**: `{ role: "user" | "assistant" | "system", content: string }` (OpenAI-compatible)
- **Ollama format**: `{ role: "user" | "assistant" | "system", content: string }`

### System Instructions
Character prompts are handled as:
- **OpenAI**: System messages with `role: "system"`
- **Google AI**: System instructions parameter
- **OpenRouter**: System messages with `role: "system"` (varies by underlying model)
- **Ollama**: System messages with `role: "system"`

## Implementation Details

### File Structure
```
src/services/
├── openaiService.ts     # OpenAI-specific implementation
├── googleAIService.ts   # Google AI-specific implementation (using @google/genai v1.6.0)
├── ollamaService.ts     # Ollama local models implementation
├── openrouterService.ts # OpenRouter multi-provider implementation
└── aiService.ts         # Unified service interface

src/hooks/
├── useOpenAI.ts         # OpenAI-specific hook (legacy)
└── useAI.ts             # Unified AI hook (recommended)
```
└── useAI.ts             # Unified AI hook (recommended)
```

### Package Updates
- **Google AI**: Updated from deprecated `@google/generative-ai` to latest `@google/genai` (v1.6.0)
- **API Changes**: The new package uses `ai.models.generateContent()` instead of `ai.getGenerativeModel()`
- **Better Performance**: The new package provides improved performance and more recent features

### Error Handling
All services include proper error handling and will throw descriptive errors for:
- Missing API keys
- Network issues
- Invalid responses
- Rate limiting
- Model availability

### API Key Management
- API keys for OpenAI, Google AI, and OpenRouter are securely stored in the application's database (IndexedDB via Dexie).
- Ollama typically doesn't require API keys (runs locally), but stores the server URL configuration.
- The application provides a configuration UI (within chat settings) to add, update, activate, or switch API keys for each provider.
- The services automatically fetch and refresh the active API key from the database as needed.
- No API keys are read from environment variables or `.env` files; all key management is handled in-app.
- The `DatabaseService` manages the `apiKeys` table and provides methods for storing and retrieving keys.

### Type Safety
All services are fully typed with TypeScript interfaces for:
- Request/response formats
- Message structures
- Configuration options
- Error types

## API Key Validation

The application now includes proactive API key validation to prevent failed requests:

### Automatic Validation in Chat Interface

Before making any AI service requests (generate response, streaming response), the application automatically checks if an API key exists for the selected provider:

- **Pre-request Validation**: Checks for API key existence before API calls
- **User-Friendly Warnings**: Shows clear messages when no API key is configured
- **Provider-Specific Messages**: Displays appropriate messaging for OpenAI vs Google AI
- **Configuration Guidance**: Directs users to the Configuration tab for API key setup

### API Key Checking Methods

```typescript
// Check if API key exists (fast, no API call)
const hasKey = await hasApiKey();

// Validate API key with actual API call
const isValid = await validateConnection();
```

### Implementation Details

The validation system works at multiple levels:

1. **Service Level**: `hasApiKey()` functions in both `openaiService.ts` and `googleAIService.ts`
2. **Unified Service**: `hasApiKey()` method in `UnifiedAIService` class
3. **Hook Level**: `hasApiKey` function in `useAI` hook
4. **Component Level**: Pre-request checks in `MainContent.tsx` chat handlers

This ensures users are informed about missing API keys before attempting requests, improving the user experience and preventing unnecessary error states.

## Migration Guide

### From OpenAI-only to Unified Service

Replace:
```typescript
import { useOpenAI } from "@/hooks/useOpenAI";
const { generateResponse } = useOpenAI();
```

With:
```typescript
import { useAI } from "@/hooks/useAI";
const { generateResponse } = useAI("openai"); // Same functionality
```

### Adding New Provider Support

**Google AI:**
1. Add your Google AI API key in the application's chat configuration UI
2. Switch provider: `switchProvider("google-ai")`
3. Use Google AI models: `generateResponse(chat, { model: "gemini-1.5-flash" })`

**OpenRouter:**
1. Get your API key from https://openrouter.ai/keys
2. Add the key in the chat configuration UI
3. Switch provider: `switchProvider("openrouter")`
4. Use any supported model: `generateResponse(chat, { model: "openai/gpt-4o" })`

**Ollama (Local):**
1. Install Ollama from https://ollama.ai
2. Configure the server URL (default: http://localhost:11434)
3. Switch provider: `switchProvider("ollama")`
4. Use local models: `generateResponse(chat, { model: "llama3.2" })`

## Best Practices

### Provider Selection
- **OpenAI**: Best for established workflows, extensive model variety
- **Google AI**: Good performance, generous free tier, fast inference
- **OpenRouter**: Access to hundreds of models from multiple providers, competitive pricing, automatic fallbacks
- **Ollama**: Local inference, privacy-focused, no API costs, requires local resources

### Model Selection
- **Development**: Use free/low-cost models (`gemini-1.5-flash`, `gpt-3.5-turbo`, local Ollama models)
- **Production**: Consider premium models for better quality (`gpt-4o`, `claude-3.5-sonnet`)
- **Cost Optimization**: OpenRouter often provides competitive pricing for popular models
- **Privacy**: Use Ollama for sensitive data that shouldn't leave your environment
- **Streaming**: All providers support real-time streaming responses

### Error Handling
Always handle API errors gracefully:
```typescript
try {
  const response = await generateResponse(chat);
  if (!response) {
    // Handle error case
    console.error("Failed to generate response");
  }
} catch (error) {
  // Handle network or API errors
  console.error("API Error:", error);
}
```
