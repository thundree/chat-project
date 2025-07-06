# Internationalization (i18n) System

This project uses a custom, lightweight internationalization system to support multiple languages.

## Current Supported Languages

- **English (en)** - Default language
- **Portuguese (pt)** - Portuguese translation

## File Structure

```
src/
├── locales/
│   ├── index.ts          # Main i18n configuration and utilities
│   ├── en.json          # English translations
│   └── pt.json          # Portuguese translations
├── hooks/
│   └── useTranslation.ts # React hook for easy translation usage
└── components/
    └── LanguageSelector.tsx # Language selector component
```

## How to Use

### 1. Using the useTranslation Hook

```tsx
import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { t, locale, changeLocale } = useTranslation();

  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>Current language: {locale}</p>
      <button onClick={() => changeLocale('pt')}>
        Switch to Portuguese
      </button>
    </div>
  );
}
```

### 2. Using the Translation Function Directly

```tsx
import { t } from '@/locales';

function MyComponent() {
  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>{t('chat.temperature')}: 0.7</p>
    </div>
  );
}
```

### 3. Adding the Language Selector

```tsx
import LanguageSelector from '@/components/LanguageSelector';

function SettingsModal() {
  return (
    <div>
      <h2>Settings</h2>
      <LanguageSelector />
    </div>
  );
}
```

## Translation Key Structure

The translation keys use dot notation for nested objects:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "chat": {
    "title": "Chat Title",
    "temperature": "Temperature"
  }
}
```

Access them as: `t('common.save')` or `t('chat.temperature')`

## Available Translation Keys

### Common Actions
- `common.save` - "Save"
- `common.saving` - "Saving..."
- `common.saved` - "Saved"
- `common.remove` - "Remove"
- `common.edit` - "Edit"
- `common.cancel` - "Cancel"
- `common.close` - "Close"
- `common.error` - "Error"

### Chat Interface
- `chat.title` - "Chat Title"
- `chat.temperature` - "Temperature"
- `chat.userName` - "Your Name"
- `chat.testConnection` - "Test API Connection"

### API Keys
- `apiKeys.title` - "API Key Configuration"
- `apiKeys.openai.title` - "OpenAI API Key"
- `apiKeys.google.title` - "Google AI API Key"
- `apiKeys.openrouter.title` - "OpenRouter API Key"
- `apiKeys.ollama.title` - "Ollama Server URL"
- `apiKeys.configured` - "✓ Configured"

### Providers
- `providers.title` - "AI Provider"
- `providers.openai` - "OpenAI (GPT Models)"
- `providers.google` - "Google AI (Gemini Models)"

### Models
- `models.title` - "Model"
- `models.refreshList` - "Refresh list"
- `models.refreshing` - "Refreshing..."
- `models.tiers.free` - "🆓 Free"
- `models.tiers.premium` - "⚡ Premium"

### Settings
- `settings.title` - "Settings"
- `settings.language` - "Language"
- `settings.theme` - "Theme"
- `settings.general` - "General Settings"
- `settings.appearance` - "Appearance"

## Adding New Languages

1. Create a new JSON file in `src/locales/` (e.g., `es.json` for Spanish)
2. Copy the structure from `en.json` and translate all values
3. Update `src/locales/index.ts`:

```typescript
import es from './es.json';

export type Locale = 'en' | 'pt' | 'es';

export const locales: Record<Locale, any> = {
  en,
  pt,
  es, // Add new language
};

export const localeNames: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español', // Add new language name
};
```

## Adding New Translation Keys

1. Add the key to all language files (`en.json`, `pt.json`, etc.)
2. Use the key in your components with `t('your.new.key')`

Example:
```json
// en.json
{
  "buttons": {
    "submit": "Submit"
  }
}

// pt.json
{
  "buttons": {
    "submit": "Enviar"
  }
}
```

```tsx
// In your component
const submitText = t('buttons.submit');
```

## Features

- **Automatic Fallback**: If a translation is missing in the current language, it falls back to English
- **Browser Language Detection**: Automatically detects browser language on first visit
- **Persistent Storage**: Language preference is saved in localStorage
- **Real-time Switching**: Language changes are applied immediately across all components
- **TypeScript Support**: Full TypeScript support with type definitions

## Best Practices

1. **Use Descriptive Keys**: Use clear, hierarchical key names like `chat.temperature` instead of just `temp`
2. **Group Related Keys**: Organize keys by feature or component (e.g., `common`, `chat`, `settings`)
3. **Keep Translations Consistent**: Use the same terminology across the app
4. **Test All Languages**: Always test your app in all supported languages
5. **Handle Dynamic Content**: For content with variables, consider using template strings or parameters

## Performance

- Translations are loaded synchronously on app start
- No dynamic imports or network requests required
- Minimal bundle size impact
- Fast translation lookups with direct object access
