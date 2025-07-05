# Database Integration - IndexedDB with Dexie

This project now uses IndexedDB (via Dexie) for storing chat data, messages, and characters, while keeping localStorage for smaller, faster data like user preferences and UI state.

## Architecture

### IndexedDB (via Dexie) - For Large Data
- **Chat data** - All chat conversations and metadata
- **Messages** - Individual chat messages with full text content
- **Characters** - Character definitions and settings

### localStorage - For Small, Fast Data
- **User preferences** - Theme, selected model, API settings
- **UI state** - Sidebar state, current selection
- **Session data** - Temporary state that needs fast access

## Migration

The system automatically migrates existing data from localStorage to IndexedDB on first load:

1. Checks if migration has been completed
2. If not, loads data from localStorage key `ttinteractive_chats`
3. Saves data to IndexedDB
4. Marks migration as completed

## Usage

### In Components

```tsx
import { useContext } from 'react';
import ChatContext from '../contexts/ChatContext';

function MyComponent() {
  const {
    chats,
    createChat,
    addMessage,
    searchChats
  } = useContext(ChatContext);

  // All operations are now async
  const handleCreateChat = async () => {
    const chatId = await createChat(character, "New Chat");
    // Handle success
  };

  const handleAddMessage = async () => {
    await addMessage(chatId, { sender: "user", text: ["Hello"] });
    // Handle success
  };

  const handleSearch = async () => {
    const results = await searchChats("search term");
    // Handle results
  };
}
```

### Using the Database Hook

```tsx
import { useDatabase } from '../hooks/useDatabase';

function DatabaseManager() {
  const {
    isLoading,
    error,
    getStats,
    exportAllData,
    clearAllData
  } = useDatabase();

  const handleExport = async () => {
    const data = await exportAllData();
    // Download or save data
  };

  const handleClearAll = async () => {
    await clearAllData();
    // Data cleared
  };
}
```

## Development Utilities

In development mode, utilities are exposed on `window.ttInteractiveUtils`:

```javascript
// In browser console:
await window.ttInteractiveUtils.getDatabaseStats()
await window.ttInteractiveUtils.exportAllData()
await window.ttInteractiveUtils.clearAllChatData()
window.ttInteractiveUtils.isMigrationCompleted()
```

## Database Schema

### Chats Table
```typescript
{
  id: string;
  title: string;
  characterName?: string;
  characterImage?: string;
  // ... other chat properties
}
```

### Messages Table
```typescript
{
  id: string;
  chatId: string; // Foreign key to chats
  sender: "user" | "character";
  text: string[];
}
```

### Characters Table  
```typescript
{
  id: string;
  name: string;
  roleInstruction: string;
  // ... other character properties
}
```

### API Keys Table
```typescript
{
  id: string; // Unique key ID
  provider: AIProvider; // "openai" or "google-ai"
  key: string; // The API key value (encrypted at rest if possible)
  isActive: boolean; // Whether this key is currently active for the provider
  createdAt: string; // ISO timestamp
  lastUsed?: string; // ISO timestamp of last use
}
```

## API Key Management

- API keys for OpenAI and Google AI are securely stored in the `apiKeys` table in IndexedDB.
- You can add, activate, deactivate, and delete API keys for each provider via the application's configuration UI.
- Only one API key per provider can be active at a time; activating a new key deactivates the previous one.
- The system automatically fetches and uses the active API key for each provider when making requests.
- API keys are never stored in localStorage or environment variables.
- Usage of each key is tracked with a `lastUsed` timestamp.

### Example Operations

- **Add API Key:** Adds a new key and sets it as active for the provider.
- **Activate API Key:** Marks a key as active and deactivates others for the provider.
- **Delete API Key:** Removes a key from the database.
- **List API Keys:** Returns all stored keys for a provider.

## Error Handling

All database operations include error handling:

- **IndexedDB errors** - Logged and optionally fall back to localStorage
- **Migration errors** - Fall back to default data
- **Save failures** - Create backup in localStorage

## Performance Considerations

- **Debounced saves** - Chat saves are debounced by 500ms to avoid excessive writes
- **Lazy loading** - Only load chat messages when needed
- **Efficient queries** - Use indexed fields for faster searches
- **Background operations** - Heavy operations don't block UI

## Backup and Export

The system provides comprehensive backup functionality:

- **Auto-backup** - Failed IndexedDB saves create localStorage backup
- **Export all data** - JSON export of all chats and characters
- **Import data** - Restore from exported backup
- **Migration safety** - Original localStorage data is preserved during migration
