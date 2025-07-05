import type { Chat, Message } from "@/types";
import React from "react";
import MessageItem from "@/components/MessageItem";
import MessageInput from "@/components/MessageInput";
import { useChat } from "@/contexts/useChat";
import CustomButton from "./CustomButton";
import { BiMessageSquareAdd } from "react-icons/bi";
import { IoInfiniteOutline } from "react-icons/io5";

interface MessageListProps {
  messages: Message[];
  selectedChat: Chat | null;
  streamingResponse: string;
  onSendMessage: (messageText: string) => void;
  onGenerateResponse: () => void;
  isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedChat,
  streamingResponse,
  onSendMessage,
  onGenerateResponse,
  isLoading = false,
}) => {
  const { currentChatId, updateMessage, deleteMessage } = useChat();

  const handleGenerateResponse = () => {
    if (selectedChat) {
      onGenerateResponse();
    }
  };

  const allMessages = React.useMemo(() => {
    const initialMessage = selectedChat?.characterInitialMessage || [];
    if (!selectedChat || initialMessage?.length === 0) return messages;
    return [
      {
        id: "0",
        sender: "character" as const,
        text: selectedChat?.characterInitialMessage || [],
      },
      ...messages,
    ];
  }, [selectedChat, messages]);

  return (
    <div className="w-full p-0 mb-4 h-auto overflow-y-auto">
      {allMessages.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 italic">
          No messages yet
        </p>
      ) : (
        allMessages.map((message) => {
          let msgSender;
          if (message.sender === "user") {
            msgSender = selectedChat?.userName ?? "User";
          } else {
            msgSender = selectedChat?.characterName ?? "Character";
          }

          return (
            <div key={message.id} className="mb-3">
              <MessageItem
                message={message}
                selectedChat={selectedChat as Chat}
                msgSender={msgSender}
                chatId={currentChatId}
                updateMessage={updateMessage}
                deleteMessage={deleteMessage}
              />
            </div>
          );
        })
      )}

      {/* Streaming Response Display */}
      {streamingResponse && (
        <div className="mb-3 p-3 rounded bg-yellow-100 dark:bg-yellow-900 mr-8">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Streaming... (Character)
          </div>
          <div className="text-gray-800 dark:text-gray-200">
            {streamingResponse}
          </div>
        </div>
      )}

      {/* Generate Response Button */}
      <div className="flex flex-wrap gap-3 mb-3">
        <CustomButton
          onClick={handleGenerateResponse}
          className="bg-green-500 w-42 ml-auto hover:bg-green-600 text-white"
          disabled={isLoading || (selectedChat?.messages?.length ?? 0) === 0}
        >
          {isLoading ? (
            <span className="flex items-center gap-2 mr-auto">
              <IoInfiniteOutline /> Generating...
            </span>
          ) : (
            <span className="flex items-center gap-2 mr-auto">
              <BiMessageSquareAdd /> New Response
            </span>
          )}
        </CustomButton>
      </div>

      {/* Message Input */}
      <div className="mb-3">
        <MessageInput
          selectedChat={selectedChat}
          onSendMessage={onSendMessage}
          onGenerateResponse={onGenerateResponse}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default MessageList;
