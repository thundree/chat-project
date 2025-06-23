import type { Chat } from "@/types";

export const replacePlaceholders = (selectedChat: Chat) => {
  if (!selectedChat) return null;

  const replacementString = (content: string) =>
    `<b class="text-blue-500">${content}</b>`;

  return {
    "{{char}}": selectedChat.characterName
      ? replacementString(selectedChat.characterName)
      : "{{char}}",
    "{{user}}": selectedChat.userName
      ? replacementString(selectedChat.userName)
      : "{{user}}",
  };
};

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
