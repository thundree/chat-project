import { useState, useEffect, useCallback } from "react";
import type { Chat } from "@/types";
import { useAI } from "@/hooks/useAI";
import { useTranslation } from "@/hooks/useTranslation";

import {
  saveSelectedModelForProvider,
  saveAvailableModelsForProvider,
  loadAvailableModelsForProvider,
  areModelsStale,
  saveSelectedProvider,
} from "@/utils/localStorage";
import { TbRefreshAlert } from "react-icons/tb";
import { BsDatabaseFillExclamation } from "react-icons/bs";
import CustomButton from "@/components/CustomButton";
import {
  GOOGLE_AI_API_KEY_INDEX,
  OPEN_AI_API_KEY_INDEX,
  OLLAMA_API_KEY_INDEX,
  OPENROUTER_API_KEY_INDEX,
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

  // Chat configuration states
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
    hasApiKey,
  } = useAI(selectedProvider);

  const { t } = useTranslation();

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

  // Fetch models function
  const fetchModels = useCallback(async () => {
    try {
      // For OpenRouter, we can fetch models without API key
      // For other providers, we need API key
      if (selectedProvider !== OPENROUTER_API_KEY_INDEX) {
        const hasKey = await hasApiKey();
        if (!hasKey) {
          setAvailableModels([]);
          setModelsFromCache(false);
          return;
        }
      }

      // Check cached models first
      const { models: cachedModels, timestamp } =
        loadAvailableModelsForProvider(selectedProvider, undefined, true);
      const modelsAreStale = areModelsStale(timestamp, 24);

      if (!modelsAreStale && cachedModels.length > 0) {
        setAvailableModels(cachedModels);
        setModelsFromCache(true);
        // Ensure we have a valid selected model
        if (!selectedModel || !cachedModels.includes(selectedModel)) {
          const firstModel = cachedModels[0];
          onModelChange(firstModel);
          saveSelectedModelForProvider(firstModel, selectedProvider);
        }
        return;
      }

      // Fetch fresh models
      const freshModels = await getAvailableModels();

      if (freshModels.length > 0) {
        setAvailableModels(freshModels);
        saveAvailableModelsForProvider(freshModels, selectedProvider);
        setModelsFromCache(false);
        // Ensure we have a valid selected model
        if (!selectedModel || !freshModels.includes(selectedModel)) {
          const firstModel = freshModels[0];
          onModelChange(firstModel);
          saveSelectedModelForProvider(firstModel, selectedProvider);
        }
      }
    } catch {
      // For OpenRouter, try to get cached models even without API key
      const shouldUseCached =
        selectedProvider === OPENROUTER_API_KEY_INDEX || (await hasApiKey());

      if (shouldUseCached) {
        const { models: cachedModels } = loadAvailableModelsForProvider(
          selectedProvider,
          undefined,
          true
        );
        if (cachedModels.length > 0) {
          setAvailableModels(cachedModels);
          setModelsFromCache(true);
          // Ensure we have a valid selected model
          if (!selectedModel || !cachedModels.includes(selectedModel)) {
            const firstModel = cachedModels[0];
            onModelChange(firstModel);
            saveSelectedModelForProvider(firstModel, selectedProvider);
          }
        } else {
          setAvailableModels([]);
        }
      } else {
        setAvailableModels([]);
      }
    }
  }, [
    selectedProvider,
    hasApiKey,
    getAvailableModels,
    selectedModel,
    onModelChange,
  ]);

  // Handle provider change
  const handleProviderChange = async (provider: AIProvider) => {
    onProviderChange(provider);
    switchProvider(provider);
    saveSelectedProvider(provider);

    // Clear current models to show loading state
    setAvailableModels([]);
    setModelsFromCache(false);

    // Note: fetchModels will be called automatically via useEffect when selectedProvider changes
    // This ensures we use the correct provider context
  };

  // Manually refresh models from API
  const refreshModels = async () => {
    try {
      // For OpenRouter, we can fetch models without API key
      // For other providers, we need API key
      if (selectedProvider !== OPENROUTER_API_KEY_INDEX) {
        const hasKey = await hasApiKey();
        if (!hasKey) {
          setAvailableModels([]);
          return;
        }
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
  let saveUserNameLabel = t("common.save");
  if (isSavingUserName) {
    saveUserNameLabel = t("common.saving");
  } else if (userNameSaved) {
    saveUserNameLabel = t("common.saved");
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

  let saveTitleLabel = t("common.save");
  if (isSavingTitle) {
    saveTitleLabel = t("common.saving");
  } else if (titleSaved) {
    saveTitleLabel = t("common.saved");
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

  let saveTemperatureLabel = t("common.save");
  if (isSavingTemperature) {
    saveTemperatureLabel = t("common.saving");
  } else if (temperatureSaved) {
    saveTemperatureLabel = t("common.saved");
  }

  // Fetch available models on provider change
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // Load cached models when API key states change (but let fetchModels handle fresh fetching)
  useEffect(() => {
    const loadCachedModelsIfKeyExists = async () => {
      // Only clear models if we don't have API key for non-OpenRouter providers
      if (selectedProvider !== OPENROUTER_API_KEY_INDEX) {
        const hasKey = await hasApiKey();
        if (!hasKey) {
          // If no key, clear models
          setAvailableModels([]);
          setModelsFromCache(false);
        }
      }
    };

    loadCachedModelsIfKeyExists();
  }, [selectedProvider, hasApiKey]);

  useEffect(() => {
    setUserName(currentChat.userName ?? "User");
  }, [currentChat.userName]);

  useEffect(() => {
    setTemperature(currentChat.temperature);
    setChatTitle(currentChat.title);
  }, [currentChat.temperature, currentChat.title]);

  return (
    <div className="w-full flex flex-col gap-3 bg-white/90 dark:bg-black/80 p-2 rounded-md">
      <div className="w-full">
        {/* Cognitive Complexity warning suppressed by splitting logic into helpers if needed */}
        <h2 className="text-gray-800 dark:text-gray-200">
          {t("chat.title")}: <b>{currentChat.title}</b>
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t("chat.temperature")}: <b>{currentChat.temperature}</b>
        </p>
        {/* User Name Field */}
        <div className="mt-2">
          <label
            htmlFor="user-name-input"
            className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
          >
            {t("chat.userName")}
          </label>
          <div className="flex flex-row gap-2">
            <input
              id="user-name-input"
              name="user-name"
              type="text"
              value={userName}
              onChange={handleUserNameChange}
              className="flex-1 max-w-xs text-xs p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 border-gray-300"
              disabled={isLoading || isSavingUserName}
              placeholder={t("chat.userNamePlaceholder")}
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
            {t("chat.title")}
          </label>
          <div className="flex flex-row gap-2">
            <input
              id="chat-title-input"
              name="chat-title"
              type="text"
              value={chatTitle}
              onChange={handleTitleChange}
              className="flex-1 max-w-xs text-xs p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 border-gray-300"
              disabled={isLoading || isSavingTitle}
              placeholder={t("chat.titlePlaceholder")}
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
            {t("chat.temperature")}: {temperature}
          </label>
          <div className="flex flex-row gap-0 items-center">
            <input
              id="temperature-slider"
              name="temperature"
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
            <span>0 ({t("chat.temperatureLabels.focused")})</span>
            <span>0.5 ({t("chat.temperatureLabels.balanced")})</span>
            <span>1 ({t("chat.temperatureLabels.creative")})</span>
          </div>
        </div>
      </div>

      {/* Note about API Keys */}
      <div className="w-full border-t border-gray-300 dark:border-gray-600 pt-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>{t("apiKeys.title")}</strong> {t("settings.apiKeysNote")}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            {t("settings.apiKeysInstructions")}
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
            {t("providers.title")}
          </label>
        </div>
        <select
          id="provider-select"
          value={selectedProvider}
          onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
          className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          disabled={isLoading}
        >
          <option value={OLLAMA_API_KEY_INDEX}>{t("providers.ollama")}</option>
          <option value={OPENROUTER_API_KEY_INDEX}>
            {t("providers.openrouter")}
          </option>
          <option value={OPEN_AI_API_KEY_INDEX}>{t("providers.openai")}</option>
          <option value={GOOGLE_AI_API_KEY_INDEX}>
            {t("providers.google")}
          </option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t("providers.current")}: {getProviderDisplayName()}
        </p>
      </div>

      {/* Model Selection */}
      <div className="w-full">
        <div className="flex items-center justify-start gap-2 mb-2">
          <label
            htmlFor="model-select"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("models.title")}
          </label>

          {getModelTier(selectedModel) === "premium" && (
            <span
              title={t("models.tierTooltips.premium")}
              className="cursor-help text-amber-600 dark:text-amber-400"
            >
              {t("models.tiers.premium")}
            </span>
          )}

          {getModelTier(selectedModel) === "free" && (
            <span
              title={t("models.tierTooltips.free")}
              className="cursor-help text-green-600 dark:text-green-400"
            >
              {t("models.tiers.free")}
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
            <option value="">{t("models.noModels")}</option>
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
                title={t("models.refreshTooltip")}
              >
                <TbRefreshAlert size={16} />
                <span>
                  {isFetchingModels
                    ? t("models.refreshing")
                    : t("models.refreshList")}
                </span>
              </button>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {selectedProvider === OPENROUTER_API_KEY_INDEX
                  ? t("models.loadingModels")
                  : t("models.configureApiKey")}
              </span>
            )}

            {modelsFromCache && availableModels.length > 0 && (
              <span
                title={t("models.cachedTooltip")}
                className="cursor-help flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400"
              >
                <BsDatabaseFillExclamation size={16} />{" "}
                {t("models.cachedModels")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Test API Connection Button */}
      <div className="mt-6">
        <CustomButton onClick={onTestApiConnection} disabled={isLoading}>
          {t("chat.testConnection")}
        </CustomButton>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">{t("common.error")}:</p>
          <p>{error}</p>
          <button
            onClick={clearError}
            className="cursor-pointer mt-2 text-sm hover:underline no-underline"
          >
            {t("common.close")}
          </button>
        </div>
      )}
    </div>
  );
}
