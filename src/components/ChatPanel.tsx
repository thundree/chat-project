import React, { Suspense, type RefObject } from "react";
import { Tabs, TabItem } from "flowbite-react";
import type { TabsRef } from "flowbite-react";
import { BsChatLeftText } from "react-icons/bs";
import { HiAdjustments } from "react-icons/hi";

const MessageList = React.lazy(() => import("@/components/MessageList"));
const ChatConfiguration = React.lazy(
  () => import("@/components/ChatConfiguration")
);

import type { Chat } from "@/types";
import { useChat } from "@/contexts/useChat";
import type { AIProvider } from "@/constants";

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
  handleGenerateResponse: () => void;
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
  handleGenerateResponse,
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

  const onTemperatureChange = (newTemperature: number) => {
    if (currentChat) {
      const updatedChat = {
        ...currentChat,
        temperature: newTemperature,
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
              onTemperatureChange={onTemperatureChange}
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
    </div>
  );
};

export default ChatPanel;
