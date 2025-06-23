import type { Chat, Message } from "@/types";
import React from "react";
import MessageItem from "@/components/MessageItem";

interface MessageListProps {
  messages: Message[];
  selectedChat: Chat | null;
  streamingResponse: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedChat,
  streamingResponse,
}) => {
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
    </div>
  );
};

export default MessageList;
