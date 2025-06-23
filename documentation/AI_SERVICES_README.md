# AI Services Integration

This project now supports both OpenAI and Google AI (Gemini) APIs through a unified interface.

## Setup

### OpenAI
Set your OpenAI API key in your environment:
```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Google AI (Gemini) - Updated Package
Set your Google AI API key in your environment:
```bash
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

You can get a Google AI API key from: https://ai.google.dev/

**Note**: This project now uses the latest `@google/genai` package (v1.6.0) instead of the deprecated `@google/generative-ai` package. The new package provides better performance and more recent API features.

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
} = useAI("openai"); // or "google-ai"

// Switch between providers
switchProvider("google-ai");

// Generate a response
const message = await generateResponse(chat, {
  model: "gemini-1.5-flash",
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

// Unified Service
import { UnifiedAIService } from "@/services/aiService";
const aiService = new UnifiedAIService("google-ai");
const response = await aiService.getChatCompletion(chat, { model: "gemini-1.5-flash" });
```

## Available Models

### OpenAI Models
- `gpt-3.5-turbo` (Recommended for most use cases)
- `gpt-4` (Premium model)
- `gpt-4-turbo-preview` (Latest GPT-4 variant)

### Google AI Models
- `gemini-1.5-flash` (Fast and efficient, free tier)
- `gemini-1.5-flash-8b` (Smaller, faster version)
- `gemini-1.5-pro` (Most capable model)
- `gemini-1.0-pro` (Previous generation)

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
Both services automatically handle message format conversion from your app's format to the respective API formats:

- **App format**: `{ sender: "user" | "character", text: string[] }`
- **OpenAI format**: `{ role: "user" | "assistant" | "system", content: string }`
- **Google AI format**: `{ role: "user" | "model", parts: [{ text: string }] }`

### System Instructions
Character prompts are handled as:
- **OpenAI**: System messages with `role: "system"`
- **Google AI**: System instructions parameter

## Implementation Details

### File Structure
```
src/services/
├── openaiService.ts     # OpenAI-specific implementation
├── googleAIService.ts   # Google AI-specific implementation (using @google/genai v1.6.0)
└── aiService.ts         # Unified service interface

src/hooks/
├── useOpenAI.ts         # OpenAI-specific hook (legacy)
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

### Type Safety
All services are fully typed with TypeScript interfaces for:
- Request/response formats
- Message structures
- Configuration options
- Error types

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

### Adding Google AI Support

1. Set your Google AI API key in `.env`
2. Switch provider: `switchProvider("google-ai")`
3. Use Google AI models: `generateResponse(chat, { model: "gemini-1.5-flash" })`

## Best Practices

### Provider Selection
- **OpenAI**: Best for established workflows, extensive model variety
- **Google AI**: Good performance, generous free tier, fast inference

### Model Selection
- **Development**: Use free tier models (`gemini-1.5-flash`, `gpt-3.5-turbo`)
- **Production**: Consider premium models for better quality
- **Streaming**: Both providers support real-time streaming responses

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
