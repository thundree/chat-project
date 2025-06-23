// Custom hook for database operations
import { useState, useCallback } from "react";
import DatabaseService from "@/services/databaseService";
import {
  getDatabaseStats,
  exportAllData,
  clearAllChatData,
} from "@/utils/databaseUtils";
import type { Chat, Character } from "@/types";

export interface DatabaseHookReturn {
  // State
  isLoading: boolean;
  error: string | null;

  // Chat operations
  searchChats: (query: string) => Promise<Chat[]>;
  getRecentChats: (limit?: number) => Promise<Chat[]>;
  exportChat: (chatId: string) => Promise<Chat | null>;

  // Character operations
  getAllCharacters: () => Promise<(Character & { id: string })[]>;
  saveCharacter: (character: Character & { id: string }) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;

  // Utility operations
  getStats: () => Promise<{
    totalChats: number;
    totalMessages: number;
    totalCharacters: number;
    migrationCompleted: boolean;
  }>;
  exportAllData: () => Promise<{
    timestamp: string;
    version: string;
    chats: Chat[];
    characters: (Character & { id: string })[];
  } | null>;
  clearAllData: () => Promise<void>;

  // Error handling
  clearError: () => void;
}

export const useDatabase = (): DatabaseHookReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsyncOperation = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await operation();
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(message);
        console.error("Database operation failed:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const searchChats = useCallback(
    async (query: string): Promise<Chat[]> => {
      const result = await handleAsyncOperation(() =>
        DatabaseService.searchChats(query)
      );
      return result ?? [];
    },
    [handleAsyncOperation]
  );

  const getRecentChats = useCallback(
    async (limit: number = 10): Promise<Chat[]> => {
      const result = await handleAsyncOperation(() =>
        DatabaseService.getRecentChats(limit)
      );
      return result ?? [];
    },
    [handleAsyncOperation]
  );

  const exportChat = useCallback(
    async (chatId: string): Promise<Chat | null> => {
      return await handleAsyncOperation(() =>
        DatabaseService.getChatById(chatId)
      );
    },
    [handleAsyncOperation]
  );

  const getAllCharacters = useCallback(async (): Promise<
    (Character & { id: string })[]
  > => {
    const result = await handleAsyncOperation(() =>
      DatabaseService.getAllCharacters()
    );
    return result ?? [];
  }, [handleAsyncOperation]);

  const saveCharacter = useCallback(
    async (character: Character & { id: string }): Promise<void> => {
      await handleAsyncOperation(() =>
        DatabaseService.saveCharacter(character)
      );
    },
    [handleAsyncOperation]
  );

  const deleteCharacter = useCallback(
    async (id: string): Promise<void> => {
      await handleAsyncOperation(() => DatabaseService.deleteCharacter(id));
    },
    [handleAsyncOperation]
  );

  const getStats = useCallback(async () => {
    const result = await handleAsyncOperation(() => getDatabaseStats());
    return (
      result ?? {
        totalChats: 0,
        totalMessages: 0,
        totalCharacters: 0,
        migrationCompleted: false,
      }
    );
  }, [handleAsyncOperation]);

  const exportData = useCallback(async () => {
    return await handleAsyncOperation(() => exportAllData());
  }, [handleAsyncOperation]);

  const clearAllData = useCallback(async (): Promise<void> => {
    await handleAsyncOperation(() => clearAllChatData());
  }, [handleAsyncOperation]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    searchChats,
    getRecentChats,
    exportChat,
    getAllCharacters,
    saveCharacter,
    deleteCharacter,
    getStats,
    exportAllData: exportData,
    clearAllData,
    clearError,
  };
};
