import React, { useState, useEffect } from "react";
import DatabaseService from "@/services/databaseService";
import { refreshApiKey as refreshGoogleApiKey } from "@/services/googleAIService";
import { refreshApiKey as refreshOpenAIApiKey } from "@/services/openaiService";

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  isOpen,
  onClose,
}) => {
  const [openaiKey, setOpenaiKey] = useState("");
  const [googleKey, setGoogleKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [hasGoogleKey, setHasGoogleKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkExistingKeys();
    }
  }, [isOpen]);

  const checkExistingKeys = async () => {
    try {
      const hasOpenAI = await DatabaseService.hasApiKey("openai");
      const hasGoogle = await DatabaseService.hasApiKey("google-ai");
      setHasOpenAIKey(hasOpenAI);
      setHasGoogleKey(hasGoogle);
    } catch (error) {
      console.error("Error checking existing keys:", error);
    }
  };

  const handleSaveOpenAI = async () => {
    if (!openaiKey.trim()) return;

    setLoading(true);
    try {
      await DatabaseService.saveApiKey("openai", openaiKey.trim());
      await refreshOpenAIApiKey();
      setOpenaiKey("");
      setHasOpenAIKey(true);
      alert("OpenAI API key saved successfully!");
    } catch (error) {
      console.error("Error saving OpenAI key:", error);
      alert("Error saving OpenAI API key. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoogle = async () => {
    if (!googleKey.trim()) return;

    setLoading(true);
    try {
      await DatabaseService.saveApiKey("google", googleKey.trim());
      await refreshGoogleApiKey();
      setGoogleKey("");
      setHasGoogleKey(true);
      alert("Google AI API key saved successfully!");
    } catch (error) {
      console.error("Error saving Google AI key:", error);
      alert("Error saving Google AI API key. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKey = async (provider: "openai" | "google") => {
    if (!confirm(`Are you sure you want to remove the ${provider} API key?`)) {
      return;
    }

    setLoading(true);
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

      alert(`${provider} API key removed successfully!`);
    } catch (error) {
      console.error(`Error removing ${provider} key:`, error);
      alert(`Error removing ${provider} API key. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">API Key Management</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* OpenAI Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">OpenAI API Key</h3>
            {hasOpenAIKey ? (
              <div className="flex items-center justify-between">
                <span className="text-green-600">✓ Key configured</span>
                <button
                  onClick={() => handleRemoveKey("openai")}
                  disabled={loading}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="Enter OpenAI API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
                <button
                  onClick={handleSaveOpenAI}
                  disabled={loading || !openaiKey.trim()}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save OpenAI Key"}
                </button>
              </div>
            )}
            <p className="text-sm text-gray-600 mt-1">
              Get your API key from{" "}
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

          {/* Google AI Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Google AI API Key</h3>
            {hasGoogleKey ? (
              <div className="flex items-center justify-between">
                <span className="text-green-600">✓ Key configured</span>
                <button
                  onClick={() => handleRemoveKey("google")}
                  disabled={loading}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="password"
                  value={googleKey}
                  onChange={(e) => setGoogleKey(e.target.value)}
                  placeholder="Enter Google AI API key"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
                <button
                  onClick={handleSaveGoogle}
                  disabled={loading || !googleKey.trim()}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Google AI Key"}
                </button>
              </div>
            )}
            <p className="text-sm text-gray-600 mt-1">
              Get your API key from{" "}
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

        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> API keys are stored locally in your browser's
            IndexedDB and are never sent to any server except the respective AI
            providers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;
