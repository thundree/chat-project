import React, {
  Suspense,
  useEffect,
  useState,
  useRef,
  lazy,
  type ReactNode,
} from "react";
const CharacterSelect = lazy(() => import("@/components/CharacterSelect"));
const AlertModal = lazy(() => import("@/components/AlertModal"));
import type { Message, Character } from "@/types";
import ChatPanel from "@/components/ChatPanel";
import type { TabsRef } from "flowbite-react";
import { detectChatId } from "@/functions";
import { useAI } from "@/hooks/useAI";
import { useChat } from "@/contexts/useChat";

import DatabaseService from "@/services/databaseService";
import {
  loadSelectedProvider,
  loadSelectedModelForProvider,
} from "@/utils/localStorage";
import { getProviderDisplayName } from "@/utils/apiKeyUtils";
import { type AIProvider } from "@/constants";

export default function MainContent() {
  // Load saved provider and model preferences
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(() =>
    loadSelectedProvider()
  );

  const [selectedModel, setSelectedModel] = useState<string>(() =>
    loadSelectedModelForProvider(selectedProvider)
  );

  // Tab state and ref for resetting on chat change
  const tabsRef = useRef<TabsRef>(null);

  // Ensure the page is loaded prior to rendering
  // This is to avoid flickering or loading states
  const [loadedPage, setLoadedPage] = useState(false);

  // Alert modal state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertContent, setAlertContent] = useState<ReactNode>(null);

  // Use chat context
  const {
    chats,
    currentChat,
    currentChatId,
    streamingResponse,
    setCurrentChat,
    addMessage,
    createChat,
  } = useChat();

  const {
    isLoading,
    error,
    generateResponse,
    validateConnection,
    clearError,
    switchProvider,
    hasApiKey,
    getDefaultModel,
  } = useAI(selectedProvider);

  const showAlert = (content: React.ReactNode) => {
    setAlertContent(content);
    setAlertOpen(true);
  };
  const closeAlert = () => {
    setAlertOpen(false);
    setAlertContent(null);
  };

  // Handle provider change
  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    switchProvider(provider);
    // Reset model to default for new provider
    const defaultModel = getDefaultModel();
    setSelectedModel(defaultModel);
  };

  // Handle model change
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const chatIdFromUrl = detectChatId();
      setCurrentChat(chatIdFromUrl);

      setTimeout(() => {
        setLoadedPage(true);
      }, 50);
    };

    // Get initial chat ID
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    // Cleanup event listener
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [setCurrentChat, chats]);

  // Reset tab to index 0 when chat id changes
  useEffect(() => {
    tabsRef.current?.setActiveTab(0);
  }, [currentChatId]);

  const handleGenerateResponse = async () => {
    if (!currentChat) {
      showAlert("No chat selected");
      return;
    }

    // Check if API key exists for the current provider
    const hasKey = await hasApiKey();
    if (!hasKey) {
      showAlert(
        <div>
          <p className="font-semibold">API Key Required</p>
          <p>
            No API key found for {getProviderDisplayName(selectedProvider)}.
          </p>
          <p>
            Please configure your API key in the Configuration tab to use this
            service.
          </p>
        </div>
      );
      return;
    }

    const newMessage = await generateResponse(currentChat, {
      model: selectedModel,
      maxTokens: 1000,
    });

    if (newMessage && currentChatId) {
      addMessage(currentChatId, newMessage);
    }
  };

  const handleValidateConnection = async () => {
    const providerName = getProviderDisplayName(selectedProvider);

    // First check if API key exists for the current provider
    try {
      const hasKey = await DatabaseService.hasApiKey(selectedProvider);

      if (!hasKey) {
        showAlert(
          `No ${providerName} API key found! Please configure your API key in the Configuration tab before testing the connection.`
        );
        return;
      }
    } catch (error) {
      console.error("Error checking API key:", error);
      showAlert(`Error checking ${providerName} API key configuration.`);
      return;
    }

    // If key exists, proceed with connection validation
    const isValid = await validateConnection();
    showAlert(
      isValid
        ? `${providerName} connection is valid!`
        : `${providerName} connection failed! Please check your API key and try again.`
    );
  };

  const onSendMessage = (messageText: string) => {
    if (messageText.trim() && currentChatId) {
      const userMessage: Omit<Message, "id"> = {
        sender: "user",
        text: [messageText.trim()],
      };
      addMessage(currentChatId, userMessage);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-900">
      {/* Alert Modal Wrapper */}
      <Suspense fallback={<div>Loading...</div>}>
        <AlertModal show={alertOpen} onClose={closeAlert} okText="OK">
          {alertContent}
        </AlertModal>
      </Suspense>

      {!loadedPage ? (
        <div className="flex m-auto items-center justify-center h-full">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      ) : (
        <div
          className="w-full flex-1 flex flex-col bg-fixed md:bg-cover md:bg-center bg-no-repeat"
          style={{
            backgroundImage: currentChat?.backgroundImage
              ? `url(${currentChat.backgroundImage})`
              : undefined,
          }}
        >
          {currentChatId && currentChat ? (
            <ChatPanel
              currentChat={currentChat}
              streamingResponse={streamingResponse}
              isLoading={isLoading}
              error={error}
              clearError={clearError}
              onModelChange={handleModelChange}
              onProviderChange={handleProviderChange}
              selectedModel={selectedModel}
              selectedProvider={selectedProvider}
              handleGenerateResponse={handleGenerateResponse}
              handleValidateConnection={handleValidateConnection}
              onSendMessage={onSendMessage}
              tabsRef={tabsRef as React.RefObject<TabsRef>}
            />
          ) : (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 mt-6">
                Select a Character to Start a New Chat
              </h2>

              <Suspense
                fallback={
                  <div className="text-gray-600 dark:text-gray-400">
                    Loading character selection...
                  </div>
                }
              >
                <CharacterSelect
                  onSelect={async (character: Character) => {
                    // Create a new chat using the context
                    const newChatId = await createChat(character);
                    window.location.hash = `#${newChatId}`;
                  }}
                />
              </Suspense>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
