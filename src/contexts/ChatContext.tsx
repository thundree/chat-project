import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { Chat, Message, Character } from "@/types";

import DatabaseService from "@/services/databaseService";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  STORAGE_KEYS,
} from "@/utils/localStorage";
import { CHAT_STORAGE_KEY } from "@/constants";

// Action types for the chat reducer
export type ChatAction =
  | { type: "SET_CHATS"; payload: Chat[] }
  | { type: "ADD_CHAT"; payload: Chat }
  | { type: "UPDATE_CHAT"; payload: { id: string; updates: Partial<Chat> } }
  | { type: "DELETE_CHAT"; payload: string }
  | { type: "SET_CURRENT_CHAT"; payload: string | null }
  | { type: "ADD_MESSAGE"; payload: { chatId: string; message: Message } }
  | {
      type: "UPDATE_MESSAGE";
      payload: { chatId: string; messageId: string; updates: Partial<Message> };
    }
  | { type: "DELETE_MESSAGE"; payload: { chatId: string; messageId: string } }
  | { type: "CLEAR_MESSAGES"; payload: string }
  | {
      type: "SET_STREAMING_RESPONSE";
      payload: { chatId: string; content: string };
    }
  | { type: "CLEAR_STREAMING_RESPONSE"; payload: string };

// Chat state interface
export interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  streamingResponses: Record<string, string>;
}

// Initial state
const initialState: ChatState = {
  chats: [],
  currentChatId: null,
  streamingResponses: {},
};

// Chat reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_CHATS":
      return {
        ...state,
        chats: action.payload,
      };

    case "ADD_CHAT":
      return {
        ...state,
        chats: [...state.chats, action.payload],
      };

    case "UPDATE_CHAT":
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload.id
            ? { ...chat, ...action.payload.updates }
            : chat
        ),
      };

    case "DELETE_CHAT":
      return {
        ...state,
        chats: state.chats.filter((chat) => chat.id !== action.payload),
        currentChatId:
          state.currentChatId === action.payload ? null : state.currentChatId,
      };

    case "SET_CURRENT_CHAT":
      return {
        ...state,
        currentChatId: action.payload,
      };

    case "ADD_MESSAGE":
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload.chatId
            ? {
                ...chat,
                messages: [...(chat.messages || []), action.payload.message],
              }
            : chat
        ),
      };

    case "UPDATE_MESSAGE":
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload.chatId
            ? {
                ...chat,
                messages: (chat.messages || []).map((message) =>
                  message.id === action.payload.messageId
                    ? { ...message, ...action.payload.updates }
                    : message
                ),
              }
            : chat
        ),
      };

    case "DELETE_MESSAGE":
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload.chatId
            ? {
                ...chat,
                messages: (chat.messages || []).filter(
                  (message) => message.id !== action.payload.messageId
                ),
              }
            : chat
        ),
      };

    case "CLEAR_MESSAGES":
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload ? { ...chat, messages: [] } : chat
        ),
      };

    case "SET_STREAMING_RESPONSE":
      return {
        ...state,
        streamingResponses: {
          ...state.streamingResponses,
          [action.payload.chatId]: action.payload.content,
        },
      };

    case "CLEAR_STREAMING_RESPONSE": {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.payload]: _removed, ...remainingResponses } =
        state.streamingResponses;
      return {
        ...state,
        streamingResponses: remainingResponses,
      };
    }

    default:
      return state;
  }
}

// Chat context interface
export interface ChatContextType {
  // State
  chats: Chat[];
  currentChat: Chat | null;
  currentChatId: string | null;
  streamingResponse: string;

  // Chat operations
  createChat: (
    character: Character,
    title?: string,
    temperature?: number
  ) => Promise<string>;
  updateChat: (id: string, updates: Partial<Chat>) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  duplicateChat: (id: string) => Promise<string>;
  setCurrentChat: (id: string | null) => void;
  getChatById: (id: string) => Chat | null;

  // Message operations
  addMessage: (chatId: string, message: Omit<Message, "id">) => Promise<string>;
  updateMessage: (
    chatId: string,
    messageId: string,
    updates: Partial<Message>
  ) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  clearMessages: (chatId: string) => Promise<void>;

  // Streaming operations
  setStreamingResponse: (chatId: string, content: string) => void;
  clearStreamingResponse: (chatId: string) => void;

  // Utility operations
  exportChat: (id: string) => Chat | null;
  importChat: (chat: Chat) => Promise<string>;
  searchChats: (query: string) => Promise<Chat[]>;
  getRecentChats: (limit?: number) => Promise<Chat[]>;
}

// Create the context
const ChatContext = createContext<ChatContextType | null>(null);

// Chat provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load chats from IndexedDB on mount with migration from localStorage
  useEffect(() => {
    const loadChats = async () => {
      try {
        // Check if migration is needed
        const migrationCompleted = loadFromLocalStorage(
          STORAGE_KEYS.MIGRATION_COMPLETED,
          false
        );

        let chats: Chat[];

        if (!migrationCompleted) {
          // First time loading, migrate from localStorage to IndexedDB
          chats = await DatabaseService.migrateFromLocalStorage(
            CHAT_STORAGE_KEY,
            []
          );

          // Mark migration as completed
          saveToLocalStorage(STORAGE_KEYS.MIGRATION_COMPLETED, true);
        } else {
          // Load from IndexedDB
          chats = await DatabaseService.getAllChats();
        }

        dispatch({ type: "SET_CHATS", payload: chats });
      } catch (error) {
        console.error("Error loading chats:", error);
        // Fallback to default data
        dispatch({ type: "SET_CHATS", payload: [] });
      }
    };

    loadChats();
  }, []);

  // Save chats to IndexedDB whenever chats change
  useEffect(() => {
    const saveChats = async () => {
      if (state.chats.length > 0) {
        try {
          await DatabaseService.saveChats(state.chats);
        } catch (error) {
          console.error("Error saving chats to IndexedDB:", error);
          // Fallback to localStorage as backup
          saveToLocalStorage(`${CHAT_STORAGE_KEY}_backup`, state.chats);
        }
      }
    };

    // Debounce the save operation to avoid too frequent writes
    const timeoutId = setTimeout(saveChats, 500);

    return () => clearTimeout(timeoutId);
  }, [state.chats]);

  // Generate unique ID for new chats/messages
  const generateId = (): string => {
    return `${Date.now()}`;
  };

  // Get current chat
  const currentChat = state.currentChatId
    ? state.chats.find((chat) => chat.id === state.currentChatId) || null
    : null;

  // Get streaming response for current chat
  const streamingResponse = state.currentChatId
    ? state.streamingResponses[state.currentChatId] || ""
    : "";

  // Chat operations
  const createChat = useCallback(
    async (
      character: Character,
      title?: string,
      temperature?: number
    ): Promise<string> => {
      const newChatId = generateId();
      const newChat: Chat = {
        id: newChatId,
        title: title ?? `Chat with ${character.name}`,
        characterName: character.name,
        characterImage: character.avatarUrl,
        characterConversationBase: character.roleInstruction,
        characterInitialMessage: character?.characterInitialMessage ?? [],
        characterColor: "#3b82f6", // Default blue color
        temperature: temperature ?? 0.7, // Use provided temperature or default to 0.7
        messages: [],
        userName: character.userCharacterName || "Username",
        backgroundImage: character.sceneBackgroundUrl,
      };

      dispatch({ type: "ADD_CHAT", payload: newChat });

      // Save to IndexedDB
      try {
        await DatabaseService.saveChat(newChat);
      } catch (error) {
        console.error("Error saving new chat to IndexedDB:", error);
      }

      return newChatId;
    },
    []
  );

  const updateChat = useCallback(
    async (id: string, updates: Partial<Chat>): Promise<void> => {
      dispatch({ type: "UPDATE_CHAT", payload: { id, updates } });

      // Update in IndexedDB
      try {
        await DatabaseService.updateChat(id, updates);
      } catch (error) {
        console.error("Error updating chat in IndexedDB:", error);
      }
    },
    []
  );

  const deleteChat = useCallback(async (id: string): Promise<void> => {
    dispatch({ type: "DELETE_CHAT", payload: id });

    // Delete from IndexedDB
    try {
      await DatabaseService.deleteChat(id);
    } catch (error) {
      console.error("Error deleting chat from IndexedDB:", error);
    }
  }, []);

  const duplicateChat = useCallback(
    async (id: string): Promise<string> => {
      const originalChat = state.chats.find((chat) => chat.id === id);
      if (!originalChat) {
        throw new Error("Chat not found");
      }

      const newChatId = generateId();
      const duplicatedChat: Chat = {
        ...originalChat,
        id: newChatId,
        title: `${originalChat.title} (Copy)`,
        messages: [...(originalChat.messages || [])].map((msg) => ({
          ...msg,
          id: generateId(),
        })),
      };

      dispatch({ type: "ADD_CHAT", payload: duplicatedChat });

      // Save to IndexedDB
      try {
        await DatabaseService.saveChat(duplicatedChat);
      } catch (error) {
        console.error("Error duplicating chat in IndexedDB:", error);
      }

      return newChatId;
    },
    [state.chats]
  );

  const setCurrentChat = useCallback((id: string | null): void => {
    dispatch({ type: "SET_CURRENT_CHAT", payload: id });
  }, []);

  const getChatById = useCallback(
    (id: string): Chat | null => {
      return state.chats.find((chat) => chat.id === id) || null;
    },
    [state.chats]
  );

  // Message operations
  const addMessage = useCallback(
    async (chatId: string, message: Omit<Message, "id">): Promise<string> => {
      const messageId = generateId();
      const fullMessage: Message = {
        ...message,
        id: messageId,
      };

      dispatch({
        type: "ADD_MESSAGE",
        payload: { chatId, message: fullMessage },
      });

      // Save to IndexedDB
      try {
        await DatabaseService.addMessage(chatId, fullMessage);
      } catch (error) {
        console.error("Error adding message to IndexedDB:", error);
      }

      return messageId;
    },
    []
  );

  const updateMessage = useCallback(
    async (
      chatId: string,
      messageId: string,
      updates: Partial<Message>
    ): Promise<void> => {
      dispatch({
        type: "UPDATE_MESSAGE",
        payload: { chatId, messageId, updates },
      });

      // Update in IndexedDB
      try {
        await DatabaseService.updateMessage(chatId, messageId, updates);
      } catch (error) {
        console.error("Error updating message in IndexedDB:", error);
      }
    },
    []
  );

  const deleteMessage = useCallback(
    async (chatId: string, messageId: string): Promise<void> => {
      dispatch({ type: "DELETE_MESSAGE", payload: { chatId, messageId } });

      // Delete from IndexedDB
      try {
        await DatabaseService.deleteMessage(chatId, messageId);
      } catch (error) {
        console.error("Error deleting message from IndexedDB:", error);
      }
    },
    []
  );

  const clearMessages = useCallback(async (chatId: string): Promise<void> => {
    dispatch({ type: "CLEAR_MESSAGES", payload: chatId });

    // Clear from IndexedDB
    try {
      await DatabaseService.clearMessages(chatId);
    } catch (error) {
      console.error("Error clearing messages from IndexedDB:", error);
    }
  }, []);

  // Streaming operations
  const setStreamingResponse = useCallback(
    (chatId: string, content: string): void => {
      dispatch({
        type: "SET_STREAMING_RESPONSE",
        payload: { chatId, content },
      });
    },
    []
  );

  const clearStreamingResponse = useCallback((chatId: string): void => {
    dispatch({ type: "CLEAR_STREAMING_RESPONSE", payload: chatId });
  }, []);

  // Utility operations
  const exportChat = useCallback(
    (id: string): Chat | null => {
      const chat = state.chats.find((chat) => chat.id === id);
      return chat ? { ...chat } : null;
    },
    [state.chats]
  );

  const importChat = useCallback(async (chat: Chat): Promise<string> => {
    const newChatId = generateId();
    const importedChat: Chat = {
      ...chat,
      id: newChatId,
      title: `${chat.title} (Imported)`,
    };

    dispatch({ type: "ADD_CHAT", payload: importedChat });

    // Save to IndexedDB
    try {
      await DatabaseService.saveChat(importedChat);
    } catch (error) {
      console.error("Error importing chat to IndexedDB:", error);
    }

    return newChatId;
  }, []);

  const searchChats = useCallback(
    async (query: string): Promise<Chat[]> => {
      try {
        return await DatabaseService.searchChats(query);
      } catch (error) {
        console.error("Error searching chats:", error);
        // Fallback to local search
        const lowercaseQuery = query.toLowerCase();

        const messageHasQuery = (message: Message): boolean => {
          return message.text.some((text) =>
            text.toLowerCase().includes(lowercaseQuery)
          );
        };

        const hasMatchingMessage = (messages: Message[]): boolean => {
          return messages.some(messageHasQuery);
        };

        return state.chats.filter((chat) => {
          const titleMatch = chat.title.toLowerCase().includes(lowercaseQuery);
          const characterMatch = chat.characterName
            ?.toLowerCase()
            .includes(lowercaseQuery);
          const messageMatch = chat.messages
            ? hasMatchingMessage(chat.messages)
            : false;

          return titleMatch || characterMatch || messageMatch;
        });
      }
    },
    [state.chats]
  );

  const getRecentChats = useCallback(
    async (limit: number = 10): Promise<Chat[]> => {
      try {
        return await DatabaseService.getRecentChats(limit);
      } catch (error) {
        console.error("Error getting recent chats:", error);
        // Fallback to local sort
        const sortedChats = [...state.chats];
        sortedChats.sort((a, b) => {
          const aLastMessage = a.messages?.[a.messages.length - 1];
          const bLastMessage = b.messages?.[b.messages.length - 1];

          if (aLastMessage && bLastMessage) {
            return parseInt(bLastMessage.id) - parseInt(aLastMessage.id);
          }

          return parseInt(b.id) - parseInt(a.id);
        });

        return sortedChats.slice(0, limit);
      }
    },
    [state.chats]
  );

  const contextValue: ChatContextType = useMemo(
    () => ({
      // State
      chats: state.chats,
      currentChat,
      currentChatId: state.currentChatId,
      streamingResponse,

      // Chat operations
      createChat,
      updateChat,
      deleteChat,
      duplicateChat,
      setCurrentChat,
      getChatById,

      // Message operations
      addMessage,
      updateMessage,
      deleteMessage,
      clearMessages,

      // Streaming operations
      setStreamingResponse,
      clearStreamingResponse,

      // Utility operations
      exportChat,
      importChat,
      searchChats,
      getRecentChats,
    }),
    [
      state.chats,
      currentChat,
      state.currentChatId,
      streamingResponse,
      createChat,
      updateChat,
      deleteChat,
      duplicateChat,
      setCurrentChat,
      getChatById,
      addMessage,
      updateMessage,
      deleteMessage,
      clearMessages,
      setStreamingResponse,
      clearStreamingResponse,
      exportChat,
      importChat,
      searchChats,
      getRecentChats,
    ]
  );

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

export default ChatContext;
