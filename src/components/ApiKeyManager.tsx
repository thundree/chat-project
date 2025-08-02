import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useGlobalApiKeys } from "@/hooks/useGlobalApiKeys";
import {
  OPEN_AI_API_KEY_INDEX,
  GOOGLE_AI_API_KEY_INDEX,
  OLLAMA_API_KEY_INDEX,
  OPENROUTER_API_KEY_INDEX,
  type AIProvider,
} from "@/constants";

interface ApiKeyManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  showTitle?: boolean;
  modal?: boolean;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  isOpen = true,
  onClose,
  className = "",
  showTitle = true,
  modal = false,
}) => {
  const { t } = useTranslation();
  const {
    hasOpenAIKey,
    hasGoogleKey,
    hasOllamaKey,
    hasOpenRouterKey,
    isSaving,
    saveApiKey,
    removeApiKey,
    validateKey,
  } = useGlobalApiKeys();

  // API Key input states
  const [openaiKey, setOpenaiKey] = useState("");
  const [googleKey, setGoogleKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [openrouterKey, setOpenrouterKey] = useState("");

  const handleSaveKey = async (provider: AIProvider, key: string) => {
    if (!key.trim()) return;

    if (!validateKey(provider, key.trim())) {
      switch (provider) {
        case OPEN_AI_API_KEY_INDEX:
          alert(t("apiKeys.openai.validation"));
          break;
        case GOOGLE_AI_API_KEY_INDEX:
          alert(t("apiKeys.google.validation"));
          break;
        case OLLAMA_API_KEY_INDEX:
          alert(t("apiKeys.ollama.validation"));
          break;
        case OPENROUTER_API_KEY_INDEX:
          alert(t("apiKeys.openrouter.validation"));
          break;
      }
      return;
    }

    try {
      await saveApiKey(provider, key.trim());
      // Clear input after successful save
      switch (provider) {
        case OPEN_AI_API_KEY_INDEX:
          setOpenaiKey("");
          break;
        case GOOGLE_AI_API_KEY_INDEX:
          setGoogleKey("");
          break;
        case OPENROUTER_API_KEY_INDEX:
          setOpenrouterKey("");
          break;
        // Ollama URL stays visible
      }
    } catch (error) {
      console.error(`Error saving ${provider} key:`, error);
      alert(t("apiKeys.saveError"));
    }
  };

  const handleRemoveKey = async (provider: AIProvider) => {
    try {
      await removeApiKey(provider);
    } catch (error) {
      console.error(`Error removing ${provider} key:`, error);
      alert(t("apiKeys.removeError"));
    }
  };

  const content = (
    <div className={`w-full ${className}`}>
      {showTitle && (
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t("apiKeys.title")}
        </h3>
      )}

      {/* OpenAI API Key */}
      <div className="mb-4">
        <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          {t("apiKeys.openai.title")}
        </span>
        {hasOpenAIKey ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              {t("apiKeys.configured")}
            </span>
            <button
              onClick={() => handleRemoveKey(OPEN_AI_API_KEY_INDEX)}
              disabled={isSaving}
              className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
            >
              {t("common.remove")}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              id="openai-key-input"
              name="openai-api-key"
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder={t("apiKeys.openai.placeholder")}
              className={`flex-1 max-w-xs text-xs p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${
                openaiKey && !validateKey(OPEN_AI_API_KEY_INDEX, openaiKey)
                  ? "border-red-300 dark:border-red-500"
                  : "border-gray-300"
              }`}
              disabled={isSaving}
            />
            <button
              onClick={() => handleSaveKey(OPEN_AI_API_KEY_INDEX, openaiKey)}
              disabled={
                isSaving ||
                !openaiKey.trim() ||
                !validateKey(OPEN_AI_API_KEY_INDEX, openaiKey)
              }
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 w-16 cursor-pointer"
            >
              {isSaving ? "..." : t("common.save")}
            </button>
          </div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t("apiKeys.openai.description")}{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {t("apiKeys.openai.link")}
          </a>
        </p>
      </div>

      {/* Google AI API Key */}
      <div className="mb-2">
        <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          {t("apiKeys.google.title")}
        </span>
        {hasGoogleKey ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              {t("apiKeys.configured")}
            </span>
            <button
              onClick={() => handleRemoveKey(GOOGLE_AI_API_KEY_INDEX)}
              disabled={isSaving}
              className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
            >
              {t("common.remove")}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              id="google-key-input"
              name="google-ai-api-key"
              type="password"
              value={googleKey}
              onChange={(e) => setGoogleKey(e.target.value)}
              placeholder={t("apiKeys.google.placeholder")}
              className={`flex-1 max-w-xs text-xs p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${
                googleKey && !validateKey(GOOGLE_AI_API_KEY_INDEX, googleKey)
                  ? "border-red-300 dark:border-red-500"
                  : "border-gray-300"
              }`}
              disabled={isSaving}
            />
            <button
              onClick={() => handleSaveKey(GOOGLE_AI_API_KEY_INDEX, googleKey)}
              disabled={
                isSaving ||
                !googleKey.trim() ||
                !validateKey(GOOGLE_AI_API_KEY_INDEX, googleKey)
              }
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 w-16 cursor-pointer"
            >
              {isSaving ? "..." : t("common.save")}
            </button>
          </div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t("apiKeys.google.description")}{" "}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {t("apiKeys.google.link")}
          </a>
        </p>
      </div>

      {/* OpenRouter Configuration */}
      <div className="mt-4 mb-2">
        <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          {t("apiKeys.openrouter.title")}
        </span>
        {hasOpenRouterKey ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              {t("apiKeys.configured")}
            </span>
            <button
              onClick={() => handleRemoveKey(OPENROUTER_API_KEY_INDEX)}
              disabled={isSaving}
              className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
            >
              {t("common.remove")}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              id="openrouter-key-input"
              name="openrouter-api-key"
              type="password"
              value={openrouterKey}
              onChange={(e) => setOpenrouterKey(e.target.value)}
              placeholder={t("apiKeys.openrouter.placeholder")}
              className={`flex-1 max-w-xs text-xs p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${
                openrouterKey &&
                !validateKey(OPENROUTER_API_KEY_INDEX, openrouterKey)
                  ? "border-red-300 dark:border-red-500"
                  : "border-gray-300"
              }`}
              disabled={isSaving}
            />
            <button
              onClick={() =>
                handleSaveKey(OPENROUTER_API_KEY_INDEX, openrouterKey)
              }
              disabled={
                isSaving ||
                !openrouterKey.trim() ||
                !validateKey(OPENROUTER_API_KEY_INDEX, openrouterKey)
              }
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 w-16 cursor-pointer"
            >
              {isSaving ? "..." : t("common.save")}
            </button>
          </div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t("apiKeys.openrouter.description")}{" "}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {t("apiKeys.openrouter.link")}
          </a>
          {". "}
          {t("apiKeys.openrouter.additionalInfo")}
        </p>
      </div>

      {/* Ollama Configuration */}
      <div className="mt-4 mb-2">
        <p className="flex gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 my-1">
          {t("apiKeys.ollama.title")}{" "}
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
              {t("apiKeys.configured")}
            </span>
            <button
              onClick={() => handleRemoveKey(OLLAMA_API_KEY_INDEX)}
              disabled={isSaving}
              className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
            >
              {t("common.edit")}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              id="ollama-url-input"
              name="ollama-base-url"
              type="url"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              placeholder={t("apiKeys.ollama.placeholder")}
              className={`flex-1 max-w-xs text-xs p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 ${
                ollamaUrl && !validateKey(OLLAMA_API_KEY_INDEX, ollamaUrl)
                  ? "border-red-300 dark:border-red-500"
                  : "border-gray-300"
              }`}
              disabled={isSaving}
            />
            <button
              onClick={() => handleSaveKey(OLLAMA_API_KEY_INDEX, ollamaUrl)}
              disabled={
                isSaving ||
                !ollamaUrl.trim() ||
                !validateKey(OLLAMA_API_KEY_INDEX, ollamaUrl)
              }
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 w-16 cursor-pointer"
            >
              {isSaving ? "..." : t("common.save")}
            </button>
          </div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t("apiKeys.ollama.description")}{" "}
          <a
            href="https://ollama.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {t("apiKeys.ollama.link")}
          </a>
        </p>
      </div>
    </div>
  );

  if (!isOpen) return null;

  if (modal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-white">
              {t("apiKeys.title")}
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            )}
          </div>
          {content}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Note:</strong> API keys are stored locally in your
              browser's IndexedDB and are never sent to any server except the
              respective AI providers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return content;
};

export default ApiKeyManager;
