// IndexedDB service using Dexie for chat and message persistence
import Dexie, { type Table } from "dexie";
import type { Chat, Message, Character, ApiKey } from "@/types";

// Define the database schema
export interface ChatDB extends Dexie {
  chats: Table<Chat>;
  messages: Table<Message & { chatId: string }>;
  characters: Table<Character & { id: string }>;
  apiKeys: Table<ApiKey>;
}

// Create the database instance
class TTInteractiveDatabase extends Dexie implements ChatDB {
  chats!: Table<Chat>;
  messages!: Table<Message & { chatId: string }>;
  characters!: Table<Character & { id: string }>;
  apiKeys!: Table<ApiKey>;

  constructor() {
    super("TTInteractiveDB");

    this.version(1).stores({
      chats: "id, title, characterName, *messages",
      messages: "id, chatId, sender, *text, [id+chatId]", // add compound index
      characters: "id, name, isOriginal",
      apiKeys: "id, provider, isActive",
    });
  }
}

// Create database instance
const db = new TTInteractiveDatabase();

// Database service functions
export class DatabaseService {
  // Chat operations
  static async getAllChats(): Promise<Chat[]> {
    try {
      const chats = await db.chats.toArray();

      // Load messages for each chat
      const chatsWithMessages = await Promise.all(
        chats.map(async (chat) => {
          const messages = await db.messages
            .where("chatId")
            .equals(chat.id)
            .toArray();

          return {
            ...chat,
            messages: messages.map((msg) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { chatId, ...message } = msg;
              return message;
            }),
          };
        })
      );

      return chatsWithMessages;
    } catch (error) {
      console.error("Error loading chats from IndexedDB:", error);
      return [];
    }
  }

  static async getChatById(id: string): Promise<Chat | null> {
    try {
      const chat = await db.chats.get(id);
      if (!chat) return null;

      const messages = await db.messages.where("chatId").equals(id).toArray();

      return {
        ...chat,
        messages: messages.map((msg) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { chatId, ...message } = msg;
          return message;
        }),
      };
    } catch (error) {
      console.error("Error loading chat from IndexedDB:", error);
      return null;
    }
  }

  static async saveChat(chat: Chat): Promise<void> {
    try {
      await db.transaction("rw", db.chats, db.messages, async () => {
        // Save chat without messages
        const { messages, ...chatData } = chat;
        await db.chats.put(chatData);

        // Save messages separately with chatId reference
        if (messages && messages.length > 0) {
          const messagesWithChatId = messages.map((message) => ({
            ...message,
            chatId: chat.id,
          }));
          await db.messages.bulkPut(messagesWithChatId);
        }
      });
    } catch (error) {
      console.error("Error saving chat to IndexedDB:", error);
      throw error;
    }
  }

  static async saveChats(chats: Chat[]): Promise<void> {
    try {
      await db.transaction("rw", db.chats, db.messages, async () => {
        // Clear existing data
        await db.chats.clear();
        await db.messages.clear();

        // Save all chats and messages
        for (const chat of chats) {
          await this.saveChat(chat);
        }
      });
    } catch (error) {
      console.error("Error saving chats to IndexedDB:", error);
      throw error;
    }
  }

  static async deleteChat(id: string): Promise<void> {
    try {
      await db.transaction("rw", db.chats, db.messages, async () => {
        await db.chats.delete(id);
        await db.messages.where("chatId").equals(id).delete();
      });
    } catch (error) {
      console.error("Error deleting chat from IndexedDB:", error);
      throw error;
    }
  }

  static async updateChat(id: string, updates: Partial<Chat>): Promise<void> {
    try {
      await db.chats.update(id, updates);
    } catch (error) {
      console.error("Error updating chat in IndexedDB:", error);
      throw error;
    }
  }

  // Message operations
  static async addMessage(chatId: string, message: Message): Promise<void> {
    try {
      await db.messages.put({ ...message, chatId });
    } catch (error) {
      console.error("Error adding message to IndexedDB:", error);
      throw error;
    }
  }

  static async updateMessage(
    chatId: string,
    messageId: string,
    updates: Partial<Message>
  ): Promise<void> {
    try {
      const existingMessage = await db.messages
        .where("[id+chatId]")
        .equals([messageId, chatId])
        .first();

      if (existingMessage) {
        await db.messages.update(existingMessage.id, updates);
      }
    } catch (error) {
      console.error("Error updating message in IndexedDB:", error);
      throw error;
    }
  }

  static async deleteMessage(chatId: string, messageId: string): Promise<void> {
    try {
      await db.messages
        .where("[id+chatId]")
        .equals([messageId, chatId])
        .delete();
    } catch (error) {
      console.error("Error deleting message from IndexedDB:", error);
      throw error;
    }
  }

  static async clearMessages(chatId: string): Promise<void> {
    try {
      await db.messages.where("chatId").equals(chatId).delete();
    } catch (error) {
      console.error("Error clearing messages from IndexedDB:", error);
      throw error;
    }
  }

  // API Key operations
  static async saveApiKey(
    provider: "openai" | "google-ai",
    key: string
  ): Promise<void> {
    try {
      await db.transaction("rw", db.apiKeys, async () => {
        // Deactivate existing keys for this provider
        await db.apiKeys
          .where("provider")
          .equals(provider)
          .modify({ isActive: false });

        // Save new key as active
        const apiKey: ApiKey = {
          id: `${provider}_${Date.now()}`,
          provider,
          key,
          isActive: true,
          createdAt: new Date().toISOString(),
        };

        await db.apiKeys.put(apiKey);
      });
    } catch (error) {
      console.error("Error saving API key to IndexedDB:", error);
      throw error;
    }
  }

  static async getActiveApiKey(
    provider: "openai" | "google-ai"
  ): Promise<string | null> {
    try {
      const apiKey = await db.apiKeys
        .where("provider")
        .equals(provider)
        .and((key) => key.isActive)
        .first();

      if (apiKey) {
        // Update last used timestamp
        await db.apiKeys.update(apiKey.id, {
          lastUsed: new Date().toISOString(),
        });
        return apiKey.key;
      }

      return null;
    } catch (error) {
      console.error("Error getting active API key from IndexedDB:", error);
      return null;
    }
  }

  static async getAllApiKeys(
    provider?: "openai" | "google-ai"
  ): Promise<ApiKey[]> {
    try {
      if (provider) {
        return await db.apiKeys.where("provider").equals(provider).toArray();
      }
      return await db.apiKeys.toArray();
    } catch (error) {
      console.error("Error loading API keys from IndexedDB:", error);
      return [];
    }
  }

  static async deleteApiKey(id: string): Promise<void> {
    try {
      await db.apiKeys.delete(id);
    } catch (error) {
      console.error("Error deleting API key from IndexedDB:", error);
      throw error;
    }
  }

  static async setActiveApiKey(id: string): Promise<void> {
    try {
      const apiKey = await db.apiKeys.get(id);
      if (!apiKey) {
        throw new Error("API key not found");
      }

      await db.transaction("rw", db.apiKeys, async () => {
        // Deactivate all keys for this provider
        await db.apiKeys
          .where("provider")
          .equals(apiKey.provider)
          .modify({ isActive: false });

        // Activate the selected key
        await db.apiKeys.update(id, { isActive: true });
      });
    } catch (error) {
      console.error("Error setting active API key:", error);
      throw error;
    }
  }

  static async hasApiKey(provider: "openai" | "google-ai"): Promise<boolean> {
    try {
      const count = await db.apiKeys
        .where("provider")
        .equals(provider)
        .and((key) => key.isActive)
        .count();
      return count > 0;
    } catch (error) {
      console.error("Error checking for API key:", error);
      return false;
    }
  }

  // Character operations
  static async getAllCharacters(): Promise<(Character & { id: string })[]> {
    try {
      return await db.characters.toArray();
    } catch (error) {
      console.error("Error loading characters from IndexedDB:", error);
      return [];
    }
  }

  static async saveCharacter(
    character: Character & { id: string }
  ): Promise<void> {
    try {
      await db.characters.put(character);
    } catch (error) {
      console.error("Error saving character to IndexedDB:", error);
      throw error;
    }
  }

  static async deleteCharacter(id: string): Promise<void> {
    try {
      await db.characters.delete(id);
    } catch (error) {
      console.error("Error deleting character from IndexedDB:", error);
      throw error;
    }
  }

  // Migration helper for moving from localStorage to IndexedDB
  static async migrateFromLocalStorage(
    localStorageKey: string,
    defaultData: Chat[]
  ): Promise<Chat[]> {
    try {
      // Check if we already have data in IndexedDB
      const existingChats = await db.chats.count();

      if (existingChats > 0) {
        // Already migrated, return IndexedDB data
        return await this.getAllChats();
      }

      // Try to load from localStorage
      const localStorageData = localStorage.getItem(localStorageKey);
      let chatsToMigrate: Chat[] = defaultData;

      if (localStorageData) {
        try {
          chatsToMigrate = JSON.parse(localStorageData);
        } catch (error) {
          console.warn(
            "Error parsing localStorage data, using default:",
            error
          );
        }
      }

      // Save to IndexedDB
      await this.saveChats(chatsToMigrate);

      // Optionally clear localStorage after successful migration
      // localStorage.removeItem(localStorageKey);

      return chatsToMigrate;
    } catch (error) {
      console.error("Error during migration:", error);
      return defaultData;
    }
  }

  // Utility functions
  static async searchChats(query: string): Promise<Chat[]> {
    try {
      const lowercaseQuery = query.toLowerCase();
      const allChats = await this.getAllChats();

      return allChats.filter((chat) => {
        const titleMatch = chat.title.toLowerCase().includes(lowercaseQuery);
        const characterMatch = chat.characterName
          ?.toLowerCase()
          .includes(lowercaseQuery);

        const messageMatch = chat.messages?.some((message) =>
          message.text.some((text) =>
            text.toLowerCase().includes(lowercaseQuery)
          )
        );

        return titleMatch || characterMatch || messageMatch;
      });
    } catch (error) {
      console.error("Error searching chats:", error);
      return [];
    }
  }

  static async getRecentChats(limit: number = 10): Promise<Chat[]> {
    try {
      const allChats = await this.getAllChats();

      const sortedChats = [...allChats];
      sortedChats.sort((a, b) => {
        const aLastMessage = a.messages?.[a.messages.length - 1];
        const bLastMessage = b.messages?.[b.messages.length - 1];

        if (aLastMessage && bLastMessage) {
          return parseInt(bLastMessage.id) - parseInt(aLastMessage.id);
        }

        return parseInt(b.id) - parseInt(a.id);
      });

      return sortedChats.slice(0, limit);
    } catch (error) {
      console.error("Error getting recent chats:", error);
      return [];
    }
  }

  // Database maintenance
  static async clearAllData(): Promise<void> {
    try {
      await db.transaction(
        "rw",
        db.chats,
        db.messages,
        db.characters,
        db.apiKeys,
        async () => {
          await db.chats.clear();
          await db.messages.clear();
          await db.characters.clear();
          await db.apiKeys.clear();
        }
      );
    } catch (error) {
      console.error("Error clearing all data:", error);
      throw error;
    }
  }
}

export default DatabaseService;
