import React, { useState, useRef, useEffect } from "react";
import { SiNginxproxymanager } from "react-icons/si";
import { IoSend } from "react-icons/io5";
import { useTranslation } from "@/hooks/useTranslation";
import type { Chat, Message } from "@/types";

interface MessageInputProps {
  selectedChat: Chat | null;
  onSendMessage: (messageText: string) => Promise<Message | undefined>;
  onGenerateResponse: (latestUserMessage?: Message) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  selectedChat,
  onSendMessage,
  onGenerateResponse,
  isLoading = false,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = Math.min(textarea.scrollHeight, 150); // Max height ~7-8 lines
      textarea.style.height = `${Math.max(scrollHeight, 72)}px`; // Min height ~3 lines
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputText]);

  const handleSubmit = async () => {
    const trimmedText = inputText.trim();
    if (trimmedText && !isLoading && !disabled) {
      const userMessage = await onSendMessage(trimmedText);
      setInputText("");
      // Small delay to ensure React state has fully propagated
      await new Promise((resolve) => setTimeout(resolve, 50));
      // Auto-generate response after the user message has been properly added
      onGenerateResponse(userMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to send message
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
    // Enter alone just creates new line (default behavior)
  };

  const userName = selectedChat?.userName ?? t("messageInput.defaultUser");

  return (
    <div className="p-2 flex gap-2 bg-white/90 dark:bg-black/80 rounded-md">
      {/* User Icon */}
      <div className="flex-shrink-0 w-14 text-gray-800 dark:text-blue-200">
        <SiNginxproxymanager className="mx-auto mt-1" size={38} />
      </div>

      <div className="flex flex-col w-full">
        {/* User Name */}
        <strong className="text-blue-600 dark:text-blue-400">{userName}</strong>

        {/* Input Area */}
        <div className="flex-1 flex items-end gap-2">
          <textarea
            ref={textareaRef}
            id="message-input"
            name="message-input"
            className="flex-1 min-h-[72px] max-h-[150px] resize-none rounded bg-gray-100/80 dark:bg-gray-800/40 text-gray-900 dark:text-gray-200 p-2 pt-0 mt-1 border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder={t("messageInput.placeholder")}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || disabled}
            rows={3}
          />

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={!inputText.trim() || isLoading || disabled}
            className="flex-shrink-0 p-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            title={t("messageInput.sendButtonTitle")}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <IoSend size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
