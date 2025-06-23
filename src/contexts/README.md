# Chat Context Documentation

The Chat Context provides a comprehensive state management solution for handling chats, messages, and streaming responses in the TTInteractive application.

## Features

- ✅ **Chat Management**: Create, update, delete, and duplicate chats
- ✅ **Message Handling**: Add, update, delete, and clear messages
- ✅ **Streaming Support**: Real-time streaming response handling
- ✅ **Search Functionality**: Search through chats by title, character, or message content
- ✅ **Persistence**: Automatic localStorage persistence
- ✅ **Type Safety**: Full TypeScript support

## Quick Start

### 1. Wrap your app with ChatProvider

```tsx
import { ChatProvider } from './contexts';

function App() {
  return (
    <ChatProvider>
      {/* Your app components */}
    </ChatProvider>
  );
}
```

### 2. Use the chat context in components

```tsx
import { useChat } from './contexts';

function ChatComponent() {
  const {
    chats,
    currentChat,
    createChat,
    addMessage,
    deleteChat
  } = useChat();

  // Component logic here
}
```

## API Reference

### Chat Operations

#### `createChat(character: Character, title?: string): Promise<string>`
Creates a new chat with the specified character and optional custom title.

```tsx
const newChatId = await createChat(character, "My Custom Chat");
```

#### `updateChat(id: string, updates: Partial<Chat>): void`
Updates an existing chat with partial data.

```tsx
updateChat(chatId, { title: "New Title", temperature: "0.8" });
```

#### `deleteChat(id: string): void`
Deletes a chat and all its messages.

```tsx
deleteChat(chatId);
```

#### `duplicateChat(id: string): Promise<string>`
Creates a copy of an existing chat with all its messages.

```tsx
const duplicatedChatId = await duplicateChat(chatId);
```

#### `setCurrentChat(id: string | null): void`
Sets the currently active chat.

```tsx
setCurrentChat(chatId);
```

#### `getChatById(id: string): Chat | null`
Retrieves a specific chat by its ID.

```tsx
const chat = getChatById(chatId);
```

### Message Operations

#### `addMessage(chatId: string, message: Omit<Message, 'id'>): string`
Adds a new message to a chat and returns the generated message ID.

```tsx
const messageId = addMessage(chatId, {
  sender: "user",
  text: ["Hello, how are you?"]
});
```

#### `updateMessage(chatId: string, messageId: string, updates: Partial<Message>): void`
Updates an existing message.

```tsx
updateMessage(chatId, messageId, {
  text: ["Updated message content"]
});
```

#### `deleteMessage(chatId: string, messageId: string): void`
Deletes a specific message from a chat.

```tsx
deleteMessage(chatId, messageId);
```

#### `clearMessages(chatId: string): void`
Removes all messages from a chat.

```tsx
clearMessages(chatId);
```

### Streaming Operations

#### `setStreamingResponse(chatId: string, content: string): void`
Sets the current streaming response content for a chat.

```tsx
setStreamingResponse(chatId, "Streaming response content...");
```

#### `clearStreamingResponse(chatId: string): void`
Clears the streaming response for a chat.

```tsx
clearStreamingResponse(chatId);
```

### Utility Operations

#### `exportChat(id: string): Chat | null`
Exports a chat for backup or sharing purposes.

```tsx
const chatData = exportChat(chatId);
```

#### `importChat(chat: Chat): string`
Imports a chat and returns the new chat ID.

```tsx
const newChatId = importChat(chatData);
```

#### `searchChats(query: string): Chat[]`
Searches through chats by title, character name, or message content.

```tsx
const results = searchChats("hello world");
```

#### `getRecentChats(limit?: number): Chat[]`
Gets the most recently active chats.

```tsx
const recentChats = getRecentChats(5);
```

## State Properties

### `chats: Chat[]`
Array of all chats in the application.

### `currentChat: Chat | null`
The currently active chat object.

### `currentChatId: string | null`
The ID of the currently active chat.

### `streamingResponse: string`
The current streaming response content for the active chat.

## Example Usage

### Creating a new chat

```tsx
function CharacterSelector({ character }) {
  const { createChat } = useChat();

  const handleSelectCharacter = async () => {
    const chatId = await createChat(character, `Chat with ${character.name}`);
    window.location.hash = `#${chatId}`;
  };

  return (
    <button onClick={handleSelectCharacter}>
      Start Chat with {character.name}
    </button>
  );
}
```

### Displaying chat list

```tsx
function ChatList() {
  const { chats, currentChatId, setCurrentChat, deleteChat } = useChat();

  return (
    <div>
      {chats.map(chat => (
        <div key={chat.id} className={chat.id === currentChatId ? 'active' : ''}>
          <span onClick={() => setCurrentChat(chat.id)}>
            {chat.title}
          </span>
          <button onClick={() => deleteChat(chat.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Handling messages

```tsx
function MessageInput() {
  const { currentChatId, addMessage } = useChat();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (currentChatId && message.trim()) {
      addMessage(currentChatId, {
        sender: 'user',
        text: [message.trim()]
      });
      setMessage('');
    }
  };

  return (
    <div>
      <input 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

## Data Persistence

The chat context automatically saves all chats to localStorage whenever the state changes. Chats are loaded from localStorage when the app starts, ensuring data persistence across sessions.

## Type Definitions

All types are available from the context module:

```tsx
import type { Chat, Message, Character, ChatContextType } from './contexts';
```

## Error Handling

The context includes built-in error handling for common scenarios:
- Attempting to use the context outside of a provider
- Trying to operate on non-existent chats
- Invalid message operations

Always wrap your app with `ChatProvider` to avoid context errors.
