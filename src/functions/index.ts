import type { Chat } from "@/types";

export const replacePlaceholders = (
  selectedChat: Chat,
  additionalReplacements?: Record<string, string>
) => {
  if (!selectedChat) return null;

  const replacementString = (content: string) =>
    `<b class="text-blue-500">${content}</b>`;

  const baseReplacements = {
    "{{char}}": selectedChat.characterName
      ? replacementString(selectedChat.characterName)
      : "{{char}}",
    "{{user}}": selectedChat.userName
      ? replacementString(selectedChat.userName)
      : "{{user}}",
  };

  // Merge with additional replacements if provided
  if (additionalReplacements) {
    const additionalFormatted = Object.entries(additionalReplacements).reduce(
      (acc, [key, value]) => {
        acc[key] = replacementString(value);
        return acc;
      },
      {} as Record<string, string>
    );

    return { ...baseReplacements, ...additionalFormatted };
  }

  return baseReplacements;
};

/**
 * Generate instructions for AI models about available placeholders
 */
export const generatePlaceholderInstructions = (
  chat: Chat,
  additionalPlaceholders?: Record<string, string>,
  standalone: boolean = false
): string => {
  const charName = chat.characterName || "the character";
  const userName = chat.userName || "the user";

  let instructions = standalone ? "" : "\n\n";
  instructions += `IMPORTANT: In your responses, you can use these placeholders:
- {{char}} outputs your name ("${charName}")
- {{user}} outputs the user's name ("${userName}")`;

  // Add any additional placeholders
  if (additionalPlaceholders) {
    Object.entries(additionalPlaceholders).forEach(
      ([placeholder, description]) => {
        instructions += `\n- ${placeholder} outputs "${description}"`;
      }
    );
  }

  instructions += `\nUse these placeholders naturally in your responses when referring to yourself, the user, or other entities.`;

  return instructions;
};

/**
 * Example of how to extend with additional placeholders:
 *
 * const customPlaceholders = {
 *   "{{location}}": "the current setting",
 *   "{{time}}": "the current time period",
 *   "{{mood}}": "the current atmosphere"
 * };
 *
 * generatePlaceholderInstructions(chat, customPlaceholders);
 */

export function MergeClasses(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export const detectChatId = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const hash = window.location.hash;
  if (!hash || hash === "#") {
    return null;
  }

  // Remove the # symbol and return the chat ID
  const chatId = hash.substring(1);

  // Check if it's a valid chat ID (not special routes like #new-chat)
  if (chatId === "new-chat" || chatId === "") {
    return null;
  }

  return chatId;
};
