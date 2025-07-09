import type { AIProvider } from "@/constants";

export type SenderType = "user" | "character";

export type ApiKey = {
  id: string;
  provider: AIProvider;
  key: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
};

export type Message = {
  id: string;
  sender: SenderType;
  text: string[];
};

export type Chat = {
  id: string;
  title: string;
  userName?: string;
  backgroundImage?: string;
  characterImage?: string;
  characterName?: string;
  characterInitialMessage?: string[];
  characterConversationBase?: string;
  characterColor?: string;
  characterVoice?: string;
  temperature: number;
  messages?: Message[];
};

export type Character = {
  name: string;
  roleInstruction: string;
  reminderMessage: string;
  characterInitialMessage?: string[];
  avatarUrl: string;
  modelName: string;
  maxTokensPerMessage: string;
  fitMessagesInContextMethod: string;
  textEmbeddingModelName: string;
  autoGenerateMemories: string;
  avatarSize: string;
  avatarShape: string;
  sceneBackgroundUrl: string;
  sceneMusicUrl: string;
  userCharacterName: string;
  userCharacterAvatarUrl: string;
  loreBookUrlsText: string;
  customCode: string;
  description: string;
  isOriginal?: boolean; // true for pre-built characters, false/undefined for user-created
};
