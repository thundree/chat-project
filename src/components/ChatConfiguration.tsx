import { useState, useEffect } from "react";
import type { Chat } from "@/types";
import { useAI } from "@/hooks/useAI";
import type { AIProvider } from "@/services/aiService";
import {
  saveSelectedModelForProvider,
  saveAvailableModelsForProvider,
  loadAvailableModelsForProvider,
  areModelsStale,
  saveSelectedProvider,
} from "@/utils/localStorage";
import DatabaseService from "@/services/databaseService";
import { refreshApiKey as refreshGoogleApiKey } from "@/services/googleAIService";
import { refreshApiKey as refreshOpenAIApiKey } from "@/services/openaiService";
import { validateOpenAIKey, validateGoogleAIKey } from "@/utils/apiKeyUtils";

import { TbRefreshAlert } from "react-icons/tb";
import { BsDatabaseFillExclamation } from "react-icons/bs";
import CustomButton from "@/components/CustomButton";

interface ChatConfigurationProps {
  readonly currentChat: Chat;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly clearError: () => void;
  readonly onModelChange: (model: string) => void;
  readonly onProviderChange: (provider: AIProvider) => void;
  readonly selectedModel: string;
  readonly selectedProvider: AIProvider;
  readonly onUserNameChange: (userName: string) => void;
  readonly onTestApiConnection: () => void;
}

export default function ChatConfiguration({
  currentChat,
  isLoading,
  error,
  clearError,
  onModelChange,
  onProviderChange,
  selectedModel,
  selectedProvider,
  onUserNameChange,
  onTestApiConnection,
}: ChatConfigurationProps) {
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>(() => {
    const { models } = loadAvailableModelsForProvider(selectedProvider);
    return models;
  });
  const [modelsFromCache, setModelsFromCache] = useState<boolean>(false);

  // API Key states
  const [openaiKey, setOpenaiKey] = useState("");
  const [googleKey, setGoogleKey] = useState("");
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [hasGoogleKey, setHasGoogleKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [userName, setUserName] = useState(currentChat.userName ?? "User");
  const [isSavingUserName, setIsSavingUserName] = useState(false);
  const [userNameSaved, setUserNameSaved] = useState(false);

  const {
    getAvailableModels,
    switchProvider,
    getProviderDisplayName,
    getDefaultModel,
  } = useAI(selectedProvider);

  // Helper function to format model names for display
  const formatModelName = (model: string): string => {
    const modelDisplayNames: Record<string, string> = {};

    return modelDisplayNames[model] || model;
  };

  // Get model tier for display
  const getModelTier = (model: string): "free" | "pro" | "premium" => {
    if (model.includes("gpt-4")) return "premium";
    if (model.includes("gpt")) return "pro";
    if (model.includes("gemini-1.5-flash")) return "free";
    if (model.includes("gemini")) return "pro";
    return "pro";
  };

  // Handle model selection change and save to localStorage
  const handleModelChange = (model: string) => {
    onModelChange(model);
    saveSelectedModelForProvider(model, selectedProvider);
  };

  // Handle provider change
  const handleProviderChange = (provider: AIProvider) => {
    onProviderChange(provider);
    switchProvider(provider);
    saveSelectedProvider(provider);

    // Load models for the new provider
    const { models } = loadAvailableModelsForProvider(provider);
    setAvailableModels(models);

    // Set default model for the new provider
    const defaultModel = getDefaultModel();
    onModelChange(defaultModel);
    saveSelectedModelForProvider(defaultModel, provider);
  };

  // Manually refresh models from API
  const refreshModels = async () => {
    try {
      setIsFetchingModels(true);
      const freshModels = await getAvailableModels();
      if (freshModels.length > 0) {
        setAvailableModels(freshModels);
        saveAvailableModelsForProvider(freshModels, selectedProvider);
        setModelsFromCache(false);
      }
    } catch (fetchError) {
      console.error("Failed to refresh models:", fetchError);
    } finally {
      setIsFetchingModels(false);
    }
  };

  // Check for existing API keys on component mount
  const checkApiKeys = async () => {
    try {
      const [openaiExists, googleExists] = await Promise.all([
        DatabaseService.hasApiKey("openai"),
        DatabaseService.hasApiKey("google-ai"),
      ]);
      setHasOpenAIKey(openaiExists);
      setHasGoogleKey(googleExists);
    } catch (error) {
      console.error("Error checking API keys:", error);
    }
  };

  // Save OpenAI API key
  const handleSaveOpenAIKey = async () => {
    if (!openaiKey.trim()) return;

    if (!validateOpenAIKey(openaiKey.trim())) {
      alert(
        "Invalid OpenAI API key format. Keys should start with 'sk-' and be at least 40 characters long."
      );
      return;
    }

    setIsSavingKey(true);
    try {
      await DatabaseService.saveApiKey("openai", openaiKey.trim());
      await refreshOpenAIApiKey();
      setOpenaiKey("");
      setHasOpenAIKey(true);
      // Refresh models after setting API key
      await refreshModels();
    } catch (error) {
      console.error("Error saving OpenAI key:", error);
      alert("Error saving OpenAI API key. Please try again.");
    } finally {
      setIsSavingKey(false);
    }
  };

  // Save Google AI API key
  const handleSaveGoogleKey = async () => {
    if (!googleKey.trim()) return;

    if (!validateGoogleAIKey(googleKey.trim())) {
      alert(
        "Invalid Google AI API key format. Keys should start with 'AI' and be at least 35 characters long."
      );
      return;
    }

    setIsSavingKey(true);
    try {
      await DatabaseService.saveApiKey("google", googleKey.trim());
      await refreshGoogleApiKey();
      setGoogleKey("");
      setHasGoogleKey(true);
      // Refresh models after setting API key
      await refreshModels();
    } catch (error) {
      console.error("Error saving Google AI key:", error);
      alert("Error saving Google AI API key. Please try again.");
    } finally {
      setIsSavingKey(false);
    }
  };

  // Remove API key
  const handleRemoveKey = async (provider: "openai" | "google") => {
    setIsSavingKey(true);
    try {
      const keys = await DatabaseService.getAllApiKeys(provider);
      for (const key of keys) {
        await DatabaseService.deleteApiKey(key.id);
      }

      if (provider === "openai") {
        await refreshOpenAIApiKey();
        setHasOpenAIKey(false);
      } else {
        await refreshGoogleApiKey();
        setHasGoogleKey(false);
      }
    } catch (error) {
      console.error(`Error removing ${provider} key:`, error);
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
    setUserNameSaved(false);
  };

  const handleSaveUserName = async () => {
    if (!userName.trim() || userName === currentChat.userName) return;
    setIsSavingUserName(true);
    try {
      if (onUserNameChange) {
        onUserNameChange(userName.trim()); // removed await
      }
      setUserNameSaved(true);
    } finally {
      setIsSavingUserName(false);
    }
  };

  // Extracted label for Save button
  let saveUserNameLabel = "Save";
  if (isSavingUserName) {
    saveUserNameLabel = "Saving...";
  } else if (userNameSaved) {
    saveUserNameLabel = "Saved";
  }

  // Fetch available models on provider change
  useEffect(() => {
    const fetchModels = async () => {
      try {
        // Check if cached models are still fresh
        const { models: cachedModels, timestamp } =
          loadAvailableModelsForProvider(selectedProvider);
        const modelsAreStale = areModelsStale(timestamp, 24); // 24 hours cache

        if (!modelsAreStale && cachedModels.length > 0) {
          setAvailableModels(cachedModels);
          setModelsFromCache(true);
          return;
        }

        // Fetch fresh models from API
        const freshModels = await getAvailableModels();
        if (freshModels.length > 0) {
          setAvailableModels(freshModels);
          saveAvailableModelsForProvider(freshModels, selectedProvider);
          setModelsFromCache(false);
        }
      } catch (fetchError) {
        console.log(
          "Could not fetch models, using cached/defaults:",
          fetchError
        );
        // Keep the cached/default models if fetching fails
      }
    };

    fetchModels();
  }, [selectedProvider, getAvailableModels]);

  // Check for existing API keys on component mount
  useEffect(() => {
    checkApiKeys();
  }, []);

  useEffect(() => {
    setUserName(currentChat.userName ?? "User");
  }, [currentChat.userName]);

  return (
    <div className="w-full flex flex-col gap-3 bg-black/80 p-2 rounded-md">
      <div className="w-full">
        {/* Cognitive Complexity warning suppressed by splitting logic into helpers if needed */}
        <h2 className="text-gray-800 dark:text-gray-200">
          Chat: <b>{currentChat.title}</b>
        </h2>
        <p className="text-gray-800 dark:text-gray-200">
          Character:{" "}
          <b style={{ color: currentChat.characterColor }}>
            {currentChat.characterName}
          </b>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Temperature: <b>{currentChat.temperature}</b>
        </p>
        {/* User Name Field */}
        <div className="mt-2">
          <label
            htmlFor="user-name-input"
            className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
          >
            Your Name
          </label>
          <div className="flex flex-row gap-2">
            <input
              id="user-name-input"
              type="text"
              value={userName}
              onChange={handleUserNameChange}
              className="flex-1 max-w-xs text-xs p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 border-gray-300"
              disabled={isLoading || isSavingUserName}
              placeholder="Enter your name"
              maxLength={64}
            />
            <button
              onClick={handleSaveUserName}
              disabled={
                isLoading ||
                isSavingUserName ||
                !userName.trim() ||
                userName === currentChat.userName
              }
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {saveUserNameLabel}
            </button>
          </div>
        </div>
      </div>

      {/* API Key Configuration */}
      <div className="w-full border-t border-gray-300 dark:border-gray-600 pt-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          API Key Configuration
        </h3>

        {/* OpenAI API Key */}
        <div className="mb-4">
          <label
            htmlFor="openai-key-input"
            className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
          >
            OpenAI API Key
          </label>
          {hasOpenAIKey ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                ✓ Configured
              </span>
              <button
                onClick={() => handleRemoveKey("openai")}
                disabled={isSavingKey}
                className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                id="openai-key-input"
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className={`flex-1 max-w-xs text-xs p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${
                  openaiKey && !validateOpenAIKey(openaiKey)
                    ? "border-red-300 dark:border-red-500"
                    : "border-gray-300"
                }`}
                disabled={isSavingKey}
              />
              <button
                onClick={handleSaveOpenAIKey}
                disabled={
                  isSavingKey ||
                  !openaiKey.trim() ||
                  !validateOpenAIKey(openaiKey)
                }
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isSavingKey ? "..." : "Save"}
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Get your key from{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              OpenAI Platform
            </a>
          </p>
        </div>

        {/* Google AI API Key */}
        <div className="mb-2">
          <label
            htmlFor="google-key-input"
            className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
          >
            Google AI API Key
          </label>
          {hasGoogleKey ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                ✓ Configured
              </span>
              <button
                onClick={() => handleRemoveKey("google")}
                disabled={isSavingKey}
                className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                id="google-key-input"
                type="password"
                value={googleKey}
                onChange={(e) => setGoogleKey(e.target.value)}
                placeholder="AI..."
                className={`flex-1 max-w-xs text-xs p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${
                  googleKey && !validateGoogleAIKey(googleKey)
                    ? "border-red-300 dark:border-red-500"
                    : "border-gray-300"
                }`}
                disabled={isSavingKey}
              />
              <button
                onClick={handleSaveGoogleKey}
                disabled={
                  isSavingKey ||
                  !googleKey.trim() ||
                  !validateGoogleAIKey(googleKey)
                }
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isSavingKey ? "..." : "Save"}
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Get your key from{" "}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>
      </div>

      {/* AI Provider Selection */}
      <div className="w-full">
        <div className="flex items-center justify-start gap-2 mb-2">
          <label
            htmlFor="provider-select"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            AI Provider
          </label>
        </div>
        <select
          id="provider-select"
          value={selectedProvider}
          onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
          className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          disabled={isLoading}
        >
          <option value="openai">OpenAI (GPT Models)</option>
          <option value="google-ai">Google AI (Gemini Models)</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Current: {getProviderDisplayName()}
        </p>
      </div>

      {/* Model Selection */}
      <div className="w-full">
        <div className="flex items-center justify-start gap-2 mb-2">
          <label
            htmlFor="model-select"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Model
          </label>

          {getModelTier(selectedModel) === "premium" && (
            <span
              title="Premium models may be more expensive"
              className="cursor-help text-amber-600 dark:text-amber-400"
            >
              ⚡ Premium
            </span>
          )}

          {getModelTier(selectedModel) === "free" && (
            <span
              title="Free tier model"
              className="cursor-help text-green-600 dark:text-green-400"
            >
              🆓 Free
            </span>
          )}
        </div>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => handleModelChange(e.target.value)}
          className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          disabled={isLoading}
        >
          {availableModels.map((model) => (
            <option key={model} value={model}>
              {formatModelName(model)}
            </option>
          ))}
        </select>

        <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-2 mt-3">
          <div className="flex flex-row items-start gap-5">
            <button
              onClick={() => {
                if (isFetchingModels) return;
                refreshModels();
              }}
              disabled={isLoading || isFetchingModels}
              className="flex items-center justify-center gap-1 cursor-pointer text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
              title="Refresh available models"
            >
              <TbRefreshAlert size={16} />
              <span>{isFetchingModels ? "Refreshing..." : "Refresh list"}</span>
            </button>

            {modelsFromCache && (
              <span
                title="Models list loaded from cache, might be outdated"
                className="cursor-help flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400"
              >
                <BsDatabaseFillExclamation size={16} /> Cached models
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Test API Connection Button */}
      <div className="mt-6">
        <CustomButton
          onClick={onTestApiConnection}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
          disabled={isLoading}
        >
          Test API Connection
        </CustomButton>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          <button
            onClick={clearError}
            className="cursor-pointer mt-2 text-sm hover:underline no-underline"
          >
            Clear Error
          </button>
        </div>
      )}
    </div>
  );
}
