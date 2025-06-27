import React, { Suspense, type RefObject } from "react";
import { Tabs, TabItem } from "flowbite-react";
import type { TabsRef } from "flowbite-react";
import { BsChatLeftText } from "react-icons/bs";
import { HiAdjustments } from "react-icons/hi";
import CustomButton from "@/components/CustomButton";

const MessageList = React.lazy(() => import("@/components/MessageList"));
const ChatConfiguration = React.lazy(
  () => import("@/components/ChatConfiguration")
);

import type { AIProvider } from "@/services/aiService";
import type { Chat } from "@/types";
import { useChat } from "@/contexts/useChat";

interface ChatPanelProps {
  currentChat: Chat;
  streamingResponse: string;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  onModelChange: (model: string) => void;
  onProviderChange: (provider: AIProvider) => void;
  selectedModel: string;
  selectedProvider: AIProvider;
  addUserMessage: () => void;
  handleGenerateResponse: () => void;
  handleStreamingResponse: () => void;
  handleValidateConnection: () => void;
  onSendMessage: (messageText: string) => void;
  tabsRef: RefObject<TabsRef>;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  currentChat,
  streamingResponse,
  isLoading,
  error,
  clearError,
  onModelChange,
  onProviderChange,
  selectedModel,
  selectedProvider,
  addUserMessage,
  handleGenerateResponse,
  handleStreamingResponse,
  handleValidateConnection,
  onSendMessage,
  tabsRef,
}) => {
  const { updateChat } = useChat();

  const onUserNameChange = (newName: string) => {
    if (currentChat) {
      const updatedChat = {
        ...currentChat,
        userName: newName,
      };
      // Assuming there's a function to update the chat in context or state
      updateChat(currentChat.id, updatedChat);
    }
  };

  const onTitleChange = (newTitle: string) => {
    if (currentChat) {
      const updatedChat = {
        ...currentChat,
        title: newTitle,
      };
      updateChat(currentChat.id, updatedChat);
    }
  };

  return (
    <div className="w-full h-auto flex-1 rounded-lg shadow-lg p-2 mt-10 mb-auto">
      <Tabs
        ref={tabsRef}
        className="[&>button]:cursor-pointer [&_[aria-label]]:bg-black/60 rounded-lg"
        aria-label="Chat Tabs"
        variant="underline"
      >
        <TabItem active title="Messages" icon={BsChatLeftText}>
          {/* Chat Messages */}
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64 text-gray-600 dark:text-gray-400">
                Loading messages...
              </div>
            }
          >
            <MessageList
              messages={currentChat.messages ?? []}
              selectedChat={currentChat}
              streamingResponse={streamingResponse}
              onSendMessage={onSendMessage}
              onGenerateResponse={handleGenerateResponse}
              isLoading={isLoading}
            />
          </Suspense>
        </TabItem>

        <TabItem title="Configuration" icon={HiAdjustments}>
          {/* Chat Configuration */}
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64 text-gray-600 dark:text-gray-400">
                Loading configuration...
              </div>
            }
          >
            <ChatConfiguration
              onUserNameChange={onUserNameChange}
              onTitleChange={onTitleChange}
              currentChat={currentChat}
              isLoading={isLoading}
              error={error}
              clearError={clearError}
              onModelChange={onModelChange}
              onProviderChange={onProviderChange}
              selectedModel={selectedModel}
              selectedProvider={selectedProvider}
              onTestApiConnection={handleValidateConnection}
            />
          </Suspense>
        </TabItem>
      </Tabs>

      <div className="flex flex-wrap gap-3 mt-6">
        <CustomButton
          onClick={addUserMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          disabled={isLoading}
        >
          Add User Message
        </CustomButton>

        <CustomButton
          onClick={handleGenerateResponse}
          className="bg-green-500 hover:bg-green-600 text-white"
          disabled={isLoading || (currentChat.messages?.length ?? 0) === 0}
        >
          {isLoading ? "Generating..." : "Generate Response"}
        </CustomButton>

        <CustomButton
          onClick={handleStreamingResponse}
          className="bg-purple-500 hover:bg-purple-600 text-white"
          disabled={isLoading || (currentChat.messages?.length ?? 0) === 0}
        >
          {isLoading ? "Streaming..." : "Stream Response"}
        </CustomButton>
      </div>
    </div>
  );
};

export default ChatPanel;
