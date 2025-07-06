import { useState, useEffect } from "react";
import type { Chat } from "@/types";
import { useAI } from "@/hooks/useAI";

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
import {
  validateOpenAIKey,
  validateGoogleAIKey,
  validateOllamaBaseUrl,
} from "@/utils/apiKeyUtils";

import { TbRefreshAlert } from "react-icons/tb";
import { BsDatabaseFillExclamation } from "react-icons/bs";
import CustomButton from "@/components/CustomButton";
import {
  GOOGLE_AI_API_KEY_INDEX,
  OPEN_AI_API_KEY_INDEX,
  OLLAMA_API_KEY_INDEX,
  type AIProvider,
} from "@/constants";

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
  readonly onTitleChange: (title: string) => void;
  readonly onTemperatureChange: (temperature: number) => void;
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
  onTitleChange,
  onTemperatureChange,
  onTestApiConnection,
}: ChatConfigurationProps) {
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelsFromCache, setModelsFromCache] = useState<boolean>(false);

  // API Key states
  const [openaiKey, setOpenaiKey] = useState("");
  const [googleKey, setGoogleKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [hasGoogleKey, setHasGoogleKey] = useState(false);
  const [hasOllamaKey, setHasOllamaKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [userName, setUserName] = useState(currentChat.userName ?? "User");
  const [isSavingUserName, setIsSavingUserName] = useState(false);
  const [userNameSaved, setUserNameSaved] = useState(false);
  const [chatTitle, setChatTitle] = useState(currentChat.title);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [titleSaved, setTitleSaved] = useState(false);
  const [temperature, setTemperature] = useState(currentChat.temperature);
  const [isSavingTemperature, setIsSavingTemperature] = useState(false);
  const [temperatureSaved, setTemperatureSaved] = useState(false);

  const {
    getAvailableModels,
    switchProvider,
    getProviderDisplayName,
    getDefaultModel,
    hasApiKey,
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
    if (model.includes("gemini-2.5-flash")) return "free";
    if (model.includes("gemini")) return "pro";
    // Ollama models are generally free (running locally)
    if (
      model.includes("llama") ||
      model.includes("mistral") ||
      model.includes("codellama") ||
      model.includes("phi") ||
      model.includes("gemma")
    )
      return "free";
    return "pro";
  };

  // Handle model selection change and save to localStorage
  const handleModelChange = (model: string) => {
    onModelChange(model);
    saveSelectedModelForProvider(model, selectedProvider);
  };

  // Handle provider change
  const handleProviderChange = async (provider: AIProvider) => {
    onProviderChange(provider);
    switchProvider(provider);
    saveSelectedProvider(provider);

    // Check if API key exists for the new provider before loading models
    const hasKey = await hasApiKey();
    if (hasKey) {
      // Load models for the new provider
      const { models } = loadAvailableModelsForProvider(
        provider,
        undefined,
        true
      );
      setAvailableModels(models);

      // Set default model for the new provider
      const defaultModel = getDefaultModel();
      onModelChange(defaultModel);
      saveSelectedModelForProvider(defaultModel, provider);
    } else {
      // Clear models if no API key is configured
      setAvailableModels([]);
    }
  };

  // Manually refresh models from API
  const refreshModels = async () => {
    try {
      // First check if API key is configured
      const hasKey = await hasApiKey();
      if (!hasKey) {
        console.log("No API key configured for", selectedProvider);
        setAvailableModels([]);
        return;
      }

      setIsFetchingModels(true);
      const freshModels = await getAvailableModels();
      if (freshModels.length > 0) {
        setAvailableModels(freshModels);
        saveAvailableModelsForProvider(freshModels, selectedProvider);
        setModelsFromCache(false);

        // Automatically select the first model if current selected model is not in the list
        if (!freshModels.includes(selectedModel)) {
          const firstModel = freshModels[0];
          onModelChange(firstModel);
          saveSelectedModelForProvider(firstModel, selectedProvider);
        }
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
      const [openaiExists, googleExists, ollamaExists] = await Promise.all([
        DatabaseService.hasApiKey(OPEN_AI_API_KEY_INDEX),
        DatabaseService.hasApiKey(GOOGLE_AI_API_KEY_INDEX),
        DatabaseService.hasApiKey(OLLAMA_API_KEY_INDEX),
      ]);
      setHasOpenAIKey(openaiExists);
      setHasGoogleKey(googleExists);
      setHasOllamaKey(ollamaExists);
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
      await DatabaseService.saveApiKey(OPEN_AI_API_KEY_INDEX, openaiKey.trim());
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
      await DatabaseService.saveApiKey(
        GOOGLE_AI_API_KEY_INDEX,
        googleKey.trim()
      );
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

  // Save Ollama URL
  const handleSaveOllamaUrl = async () => {
    if (!ollamaUrl.trim()) return;

    if (!validateOllamaBaseUrl(ollamaUrl.trim())) {
      alert(
        "Invalid Ollama URL format. Please enter a valid URL (e.g., http://localhost:11434)."
      );
      return;
    }

    setIsSavingKey(true);
    try {
      await DatabaseService.saveApiKey(OLLAMA_API_KEY_INDEX, ollamaUrl.trim());
      setHasOllamaKey(true);
      // Refresh models after setting URL
      await refreshModels();
    } catch (error) {
      console.error("Error saving Ollama URL:", error);
      alert("Error saving Ollama URL. Please try again.");
    } finally {
      setIsSavingKey(false);
    }
  };

  // Remove API key
  const handleRemoveKey = async (provider: AIProvider) => {
    setIsSavingKey(true);
    try {
      const keys = await DatabaseService.getAllApiKeys(provider);
      for (const key of keys) {
        await DatabaseService.deleteApiKey(key.id);
      }

      if (provider === OPEN_AI_API_KEY_INDEX) {
        await refreshOpenAIApiKey();
        setHasOpenAIKey(false);
      } else if (provider === GOOGLE_AI_API_KEY_INDEX) {
        await refreshGoogleApiKey();
        setHasGoogleKey(false);
      } else if (provider === OLLAMA_API_KEY_INDEX) {
        setHasOllamaKey(false);
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
    const newUserName = userName.trim();
    if (!newUserName || userName === currentChat.userName) return;
    setIsSavingUserName(true);
    try {
      if (onUserNameChange) {
        onUserNameChange(newUserName);
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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatTitle(e.target.value);
    setTitleSaved(false);
  };

  const handleSaveTitle = async () => {
    if (!chatTitle.trim() || chatTitle === currentChat.title) return;
    setIsSavingTitle(true);
    try {
      if (onTitleChange) {
        onTitleChange(chatTitle.trim());
      }
      setTitleSaved(true);
    } finally {
      setIsSavingTitle(false);
    }
  };

  let saveTitleLabel = "Save";
  if (isSavingTitle) {
    saveTitleLabel = "Saving...";
  } else if (titleSaved) {
    saveTitleLabel = "Saved";
  }

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemperature(parseFloat(e.target.value));
    setTemperatureSaved(false);
  };

  const handleSaveTemperature = async () => {
    if (temperature === currentChat.temperature) return;
    setIsSavingTemperature(true);
    try {
      if (onTemperatureChange) {
        onTemperatureChange(temperature);
      }
      setTemperatureSaved(true);
    } finally {
      setIsSavingTemperature(false);
    }
  };

  let saveTemperatureLabel = "Save";
  if (isSavingTemperature) {
    saveTemperatureLabel = "Saving...";
  } else if (temperatureSaved) {
    saveTemperatureLabel = "Saved";
  }

  // Fetch available models on provider change
  useEffect(() => {
    const fetchModels = async () => {
      try {
        // First check if API key is configured for the current provider
        const hasKey = await hasApiKey();
        if (!hasKey) {
          // No API key configured, clear models
          setAvailableModels([]);
          setModelsFromCache(false);
          return;
        }

        // Check if cached models are still fresh
        const { models: cachedModels, timestamp } =
          loadAvailableModelsForProvider(selectedProvider, undefined, true);
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

          // Automatically select the first model if current selected model is not in the list
          if (!freshModels.includes(selectedModel)) {
            const firstModel = freshModels[0];
            onModelChange(firstModel);
            saveSelectedModelForProvider(firstModel, selectedProvider);
          }
        }
      } catch (fetchError) {
        console.log(
          "Could not fetch models, using cached/defaults:",
          fetchError
        );
        // If API key exists but fetching fails, try to use cached models
        const hasKey = await hasApiKey();
        if (hasKey) {
          const { models: cachedModels } = loadAvailableModelsForProvider(
            selectedProvider,
            undefined,
            true
          );
          setAvailableModels(cachedModels);
          setModelsFromCache(true);
        } else {
          setAvailableModels([]);
        }
      }
    };

    fetchModels();
  }, [
    selectedProvider,
    getAvailableModels,
    selectedModel,
    onModelChange,
    hasApiKey,
  ]);

  // Check for existing API keys on component mount
  useEffect(() => {
    checkApiKeys();
  }, []);

  // Load models when API key states change
  useEffect(() => {
    const loadModelsIfKeyExists = async () => {
      const hasKey = await hasApiKey();
      if (hasKey && availableModels.length === 0) {
        // If we have a key but no models loaded, try to load them
        const { models: cachedModels } = loadAvailableModelsForProvider(
          selectedProvider,
          undefined,
          true
        );
        setAvailableModels(cachedModels);
        setModelsFromCache(true);
      } else if (!hasKey) {
        // If no key, clear models
        setAvailableModels([]);
        setModelsFromCache(false);
      }
    };

    loadModelsIfKeyExists();
  }, [
    hasOpenAIKey,
    hasGoogleKey,
    hasOllamaKey,
    selectedProvider,
    hasApiKey,
    availableModels.length,
  ]);

  useEffect(() => {
    setUserName(currentChat.userName ?? "User");
  }, [currentChat.userName]);

  useEffect(() => {
    setTemperature(currentChat.temperature);
    setChatTitle(currentChat.title);
  }, [currentChat.temperature, currentChat.title]);

  return (
    <div className="w-full flex flex-col gap-3 bg-black/80 p-2 rounded-md">
      <div className="w-full">
        {/* Cognitive Complexity warning suppressed by splitting logic into helpers if needed */}
        <h2 className="text-gray-800 dark:text-gray-200">
          Chat: <b>{currentChat.title}</b>
        </h2>
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
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 w-16 cursor-pointer"
            >
              {saveUserNameLabel}
            </button>
          </div>
        </div>
        {/* Chat Title Field */}
        <div className="mt-2">
          <label
            htmlFor="chat-title-input"
            className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
          >
            Chat Title
          </label>
          <div className="flex flex-row gap-2">
            <input
              id="chat-title-input"
              type="text"
              value={chatTitle}
              onChange={handleTitleChange}
              className="flex-1 max-w-xs text-xs p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 border-gray-300"
              disabled={isLoading || isSavingTitle}
              placeholder="Enter a title for your chat"
              maxLength={128}
            />
            <button
              onClick={handleSaveTitle}
              disabled={
                isLoading ||
                isSavingTitle ||
                !chatTitle.trim() ||
                chatTitle === currentChat.title
              }
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 w-16 cursor-pointer"
            >
              {saveTitleLabel}
            </button>
          </div>
        </div>
        {/* Temperature Slider */}
        <div className="mt-2">
          <label
            htmlFor="temperature-slider"
            className="block text-xs font-medium text-gray-600 dark:text-gray-400 -mb-1 pt-1"
          >
            Temperature: {temperature}
          </label>
          <div className="flex flex-row gap-0 items-center">
            <input
              id="temperature-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={temperature}
              onChange={handleTemperatureChange}
              className="flex-1 max-w-xs h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
              disabled={isLoading || isSavingTemperature}
            />
            <button
              onClick={handleSaveTemperature}
              disabled={
                isLoading ||
                isSavingTemperature ||
                temperature === currentChat.temperature
              }
              className="px-3 h-[34px] ml-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 w-16 cursor-pointer"
            >
              {saveTemperatureLabel}
            </button>
          </div>
          <div className="flex max-w-xs justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0 (Focused)</span>
            <span>.5 (Balanced)</span>
            <span>1 (Creative)</span>
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
          <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            OpenAI API Key
          </span>
          {hasOpenAIKey ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                ✓ Configured
              </span>
              <button
                onClick={() => handleRemoveKey(OPEN_AI_API_KEY_INDEX)}
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
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 w-16 cursor-pointer"
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
          <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Google AI API Key
          </span>
          {hasGoogleKey ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                ✓ Configured
              </span>
              <button
                onClick={() => handleRemoveKey(GOOGLE_AI_API_KEY_INDEX)}
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
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 w-16 cursor-pointer"
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

        {/* Ollama Configuration */}
        <div className="mt-4 mb-2">
          <p className="flex gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 my-1">
            Ollama Server URL{" "}
            <a
              href={ollamaUrl.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-2 text-xs underline text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
            >
              <i>{ollamaUrl.trim()}</i>
            </a>
          </p>
          {hasOllamaKey ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                ✓ Configured
              </span>
              <button
                onClick={() => handleRemoveKey(OLLAMA_API_KEY_INDEX)}
                disabled={isSavingKey}
                className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                id="ollama-url-input"
                type="url"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className={`flex-1 max-w-xs text-xs p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${
                  ollamaUrl && !validateOllamaBaseUrl(ollamaUrl)
                    ? "border-red-300 dark:border-red-500"
                    : "border-gray-300"
                }`}
                disabled={isSavingKey}
              />
              <button
                onClick={handleSaveOllamaUrl}
                disabled={
                  isSavingKey ||
                  !ollamaUrl.trim() ||
                  !validateOllamaBaseUrl(ollamaUrl)
                }
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 w-16 cursor-pointer"
              >
                {isSavingKey ? "..." : "Save"}
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Local Ollama server URL. Install Ollama from{" "}
            <a
              href="https://ollama.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              ollama.ai
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
          <option value={OPEN_AI_API_KEY_INDEX}>OpenAI (GPT Models)</option>
          <option value={GOOGLE_AI_API_KEY_INDEX}>
            Google AI (Gemini Models)
          </option>
          <option value={OLLAMA_API_KEY_INDEX}>Ollama (Local Models)</option>
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
          disabled={isLoading || availableModels.length === 0}
        >
          {availableModels.length === 0 ? (
            <option value="">
              No models available - Configure API key first
            </option>
          ) : (
            availableModels.map((model) => (
              <option key={model} value={model}>
                {formatModelName(model)}
              </option>
            ))
          )}
        </select>

        <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-2 mt-3">
          <div className="flex flex-row items-start gap-5">
            {availableModels.length > 0 ? (
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
                <span>
                  {isFetchingModels ? "Refreshing..." : "Refresh list"}
                </span>
              </button>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Configure an API key above to load models
              </span>
            )}

            {modelsFromCache && availableModels.length > 0 && (
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
