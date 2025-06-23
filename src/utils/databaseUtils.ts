// Database migration and utility functions
import DatabaseService from "@/services/databaseService";
import {
  STORAGE_KEYS,
  loadFromLocalStorage,
  saveToLocalStorage,
} from "@/utils/localStorage";

import type { Chat, Character } from "@/types";

/**
 * Check if the migration from localStorage to IndexedDB has been completed
 */
export const isMigrationCompleted = (): boolean => {
  return loadFromLocalStorage(STORAGE_KEYS.MIGRATION_COMPLETED, false);
};

/**
 * Force a complete migration from localStorage to IndexedDB
 * Useful for development or troubleshooting
 */
export const forceMigration = async (): Promise<void> => {
  try {
    // Clear IndexedDB
    await DatabaseService.clearAllData();

    // Reset migration flag
    saveToLocalStorage(STORAGE_KEYS.MIGRATION_COMPLETED, false);

    // Trigger migration by loading chats
    const legacyChats = loadFromLocalStorage<Chat[]>(
      STORAGE_KEYS.CHAT_HISTORY,
      []
    );

    if (legacyChats.length > 0) {
      await DatabaseService.saveChats(legacyChats);
      console.log(`Migrated ${legacyChats.length} chats to IndexedDB`);
    }

    // Mark migration as completed
    saveToLocalStorage(STORAGE_KEYS.MIGRATION_COMPLETED, true);
  } catch (error) {
    console.error("Error during forced migration:", error);
    throw error;
  }
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async () => {
  try {
    const chats = await DatabaseService.getAllChats();
    const totalMessages = chats.reduce(
      (sum, chat) => sum + (chat.messages?.length ?? 0),
      0
    );
    const characters = await DatabaseService.getAllCharacters();

    return {
      totalChats: chats.length,
      totalMessages,
      totalCharacters: characters.length,
      migrationCompleted: isMigrationCompleted(),
    };
  } catch (error) {
    console.error("Error getting database stats:", error);
    return {
      totalChats: 0,
      totalMessages: 0,
      totalCharacters: 0,
      migrationCompleted: false,
    };
  }
};

/**
 * Export all data for backup purposes
 */
export const exportAllData = async () => {
  try {
    const chats = await DatabaseService.getAllChats();
    const characters = await DatabaseService.getAllCharacters();

    const backup = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      chats,
      characters,
    };

    return backup;
  } catch (error) {
    console.error("Error exporting data:", error);
    throw error;
  }
};

/**
 * Import data from backup
 */
export const importAllData = async (backup: {
  chats: Chat[];
  characters: (Character & { id: string })[];
}) => {
  try {
    if (backup.chats?.length > 0) {
      await DatabaseService.saveChats(backup.chats);
    }

    if (backup.characters?.length > 0) {
      for (const character of backup.characters) {
        await DatabaseService.saveCharacter(character);
      }
    }

    console.log("Data import completed successfully");
  } catch (error) {
    console.error("Error importing data:", error);
    throw error;
  }
};

/**
 * Clear all chat data (useful for development/testing)
 */
export const clearAllChatData = async (): Promise<void> => {
  try {
    await DatabaseService.clearAllData();

    // Also clear localStorage backup and migration flag
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    localStorage.removeItem("ttinteractive_chats_backup");
    saveToLocalStorage(STORAGE_KEYS.MIGRATION_COMPLETED, false);

    console.log("All chat data cleared");
  } catch (error) {
    console.error("Error clearing chat data:", error);
    throw error;
  }
};

// Expose utilities to window for development (only in development mode)
declare const process: { env: { NODE_ENV: string } };

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const devUtils = {
    forceMigration,
    getDatabaseStats,
    exportAllData,
    importAllData,
    clearAllChatData,
    isMigrationCompleted,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ttInteractiveUtils = devUtils;
}
