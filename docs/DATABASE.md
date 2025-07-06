# 💾 Database & Storage Guide

Welcome to the database documentation! TTInteractive uses a hybrid storage approach for optimal performance and user experience.

## 🏗️ Storage Architecture Overview

TTInteractive uses two storage systems working together:

### 📊 IndexedDB (Primary Data)
**Where**: Your browser's IndexedDB (via Dexie library)  
**What**: Chats, messages, characters, API keys  
**Why**: Large data storage, complex queries, offline support

### ⚡ localStorage (Quick Access)
**Where**: Your browser's localStorage  
**What**: User preferences, UI state, cached data  
**Why**: Instant access, simple settings, no async calls needed

## 🗄️ What Gets Stored Where

### IndexedDB Stores:
- 💬 **Chat conversations** - All your chat history
- 📝 **Individual messages** - Every message with timestamps
- 🎭 **Character definitions** - AI character prompts and settings
- 🔐 **API keys** - Securely encrypted provider credentials

### localStorage Stores:
- 🎨 **Theme preference** - Dark/light mode choice
- 🤖 **Selected AI provider** - Your preferred AI service
- 📱 **Model selections** - Preferred model for each provider
- 🎚️ **Temperature settings** - Creativity settings per provider
- 📐 **UI state** - Sidebar open/closed, window sizes
- 📋 **Model cache** - Available models list (refreshed daily)

## 🚀 Getting Started

Good news! You don't need to do anything special. The storage system works automatically:

1. **First visit**: App creates the database structure
2. **Creating chats**: Automatically saved to IndexedDB
3. **Sending messages**: Instantly persisted
4. **Changing settings**: Saved to localStorage immediately
5. **API keys**: Encrypted and stored securely

## 🔄 Automatic Migration

If you used TTInteractive before the IndexedDB update, don't worry! The app automatically migrates your data:

### What Gets Migrated:
- ✅ All existing chats and messages
- ✅ Character configurations
- ✅ User preferences and settings
- ✅ API key configurations

### Migration Process:
1. **Detection**: App checks if old localStorage data exists
2. **Backup**: Original data stays as backup
3. **Transfer**: Data moves to IndexedDB format
4. **Verification**: Ensures all data transferred correctly
5. **Completion**: Sets migration flag to prevent re-running

### If Migration Fails:
Your original data is safe! The app falls back to localStorage mode and you can try again.

## 🎯 Using the Database

### Through Chat Context (Recommended)

The easiest way to interact with your data:

```typescript
import { useChat } from "@/contexts/useChat";

function MyComponent() {
  const {
    chats,              // All your chats
    currentChat,        // Currently active chat
    createChat,         // Create new chat
    addMessage,         // Add message to chat
    deleteChat,         // Delete chat (with confirmation)
    searchChats         // Search through all chats
  } = useChat();

  // Create a new chat
  const newChatId = await createChat(character, "My New Chat");
  
  // Add a message
  addMessage(chatId, {
    sender: "user",
    text: ["Hello there!"]
  });

  // Search your chats
  const results = searchChats("machine learning");
}
```

### Direct Database Access (Advanced)

For advanced use cases:

```typescript
import DatabaseService from "@/services/databaseService";

// Get specific chat
const chat = await DatabaseService.getChat(chatId);

// Get all messages for a chat
const messages = await DatabaseService.getMessages(chatId);

// Bulk operations
const allChats = await DatabaseService.getAllChats();

// API key management
const hasOpenAIKey = await DatabaseService.hasApiKey("openai");
const apiKey = await DatabaseService.getActiveApiKey("openai");
```

## 🔧 Development Tools

### Browser Console Commands

TTInteractive includes helpful debug commands:

```javascript
// Check migration status
window.ttInteractiveUtils.isMigrationCompleted()

// Get database statistics
await window.ttInteractiveUtils.getDatabaseStats()
// Returns: { totalChats: 5, totalMessages: 150, totalCharacters: 3 }

// Export all your data for backup
const backup = await window.ttInteractiveUtils.exportAllData()

// Search across all data
const results = await window.ttInteractiveUtils.searchAllData("keyword")

// Clear all data (careful!)
await window.ttInteractiveUtils.clearAllChatData()
```

### Development Database Inspection

```javascript
// Check database health
await window.ttInteractiveUtils.validateDatabase()

// Get storage usage
await window.ttInteractiveUtils.getStorageUsage()
// Returns storage size in bytes

// Force migration (if needed)
await window.ttInteractiveUtils.forceMigration()
```

## 📊 Data Structure

### Chat Object
```typescript
interface Chat {
  id: string;                    // Unique identifier
  title: string;                 // Chat display name
  characterId: string;           // Associated character
  characterName: string;         // Character display name
  characterInitialPrompt?: string;  // AI system prompt
  characterInitialMessage?: string[]; // Welcome message
  userName: string;              // Your display name
  temperature: number;           // AI creativity (0.1-1.0)
  createdAt: Date;              // When created
  updatedAt: Date;              // Last modified
  backgroundImage?: string;      // Chat background
}
```

### Message Object
```typescript
interface Message {
  id: string;                    // Unique identifier
  chatId: string;               // Parent chat ID
  sender: "user" | "character"; // Who sent it
  text: string[];               // Message content (array for rich text)
  timestamp: Date;              // When sent
}
```

### API Key Object
```typescript
interface ApiKey {
  id: string;                   // Unique identifier
  provider: AIProvider;         // openai, google, openrouter, ollama
  keyValue: string;            // Encrypted API key
  isActive: boolean;           // Currently in use
  createdAt: Date;             // When added
}
```

## 🔒 Security & Privacy

### API Key Security
- **Encryption**: API keys are encrypted before storage
- **Local only**: Keys never leave your device
- **Secure storage**: Uses browser's secure IndexedDB
- **No transmission**: Keys aren't sent to our servers

### Data Privacy
- **Local storage**: All data stays on your device
- **No cloud sync**: We don't store your chats
- **Browser isolation**: Data can't be accessed by other websites
- **User control**: You can export or delete data anytime

### Storage Limits
- **IndexedDB**: Typically 50MB-10GB depending on device
- **localStorage**: ~5-10MB limit
- **Automatic cleanup**: Old cached data is removed automatically

## 🛠️ Troubleshooting

### "Database error" or "Failed to save"
```javascript
// Check database status
await window.ttInteractiveUtils.validateDatabase()

// Check storage space
await window.ttInteractiveUtils.getStorageUsage()

// Try clearing cache (keeps your chats)
localStorage.clear()
```

### Migration Problems
```javascript
// Check migration status
window.ttInteractiveUtils.isMigrationCompleted()

// Force re-migration if needed
await window.ttInteractiveUtils.forceMigration()

// Export data before trying fixes
const backup = await window.ttInteractiveUtils.exportAllData()
```

### Lost Chats or Data
```javascript
// Check if data exists in old format
Object.keys(localStorage).filter(key => key.includes('chat'))

// Try manual recovery
await window.ttInteractiveUtils.recoverLostData()

// Import from backup
await window.ttInteractiveUtils.importData(backupData)
```

### Performance Issues
```javascript
// Check database size
const stats = await window.ttInteractiveUtils.getDatabaseStats()

// Clear old cached data
await window.ttInteractiveUtils.cleanupCache()

// Optimize database
await window.ttInteractiveUtils.optimizeDatabase()
```

## 📋 Best Practices

### For Users
- **Regular exports**: Backup your important chats
- **Clean up**: Delete old chats you don't need
- **Monitor storage**: Check storage usage occasionally
- **Update browser**: Keep your browser updated for best performance

### For Developers
- **Always use async**: Database operations are asynchronous
- **Handle errors**: Wrap database calls in try-catch
- **Batch operations**: Use bulk methods for multiple items
- **Test migration**: Verify data migration thoroughly

## 📈 Performance Tips

### Faster Loading
- App caches frequently accessed data
- Recent chats load first
- Messages load on-demand
- Models are cached for 24 hours

### Storage Optimization
- Messages are compressed for storage
- Old cache data is automatically cleaned
- Indexes speed up searches
- Batch writes reduce database load

## 🔄 Backup & Export

### Export Individual Chat
```typescript
const { exportChat } = useChat();
const chatData = exportChat(chatId);
// Download as JSON file
```

### Export All Data
```javascript
const backup = await window.ttInteractiveUtils.exportAllData();
// Contains all chats, messages, settings
```

### Import Data
```typescript
const { importChat } = useChat();
const newChatId = importChat(chatData);
```

## 🆘 Need Help?

- **Lost data?** Check the troubleshooting section above
- **Migration issues?** Use the console commands to diagnose
- **Performance problems?** Try the performance tips
- **Still stuck?** Create an issue on [GitHub](https://github.com/thundree/chat-project/issues)

---

Your data is safe and sound! 🛡️ The database system is designed to be reliable, fast, and user-friendly.
