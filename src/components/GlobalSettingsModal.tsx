import React, { useState, useEffect } from "react";
import { Label, Select } from "flowbite-react";
import { useTheme } from "@/contexts/useTheme";
import { useTranslation } from "@/hooks/useTranslation";
import type { Theme } from "@/contexts/themeContext";
import GenericModal from "@/components/GenericModal";
import LanguageSelector from "@/components/LanguageSelector";
import ApiKeyManager from "@/components/ApiKeyManager";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  saveUserPreferences,
  loadUserPreferences,
  exportAppData,
  getStorageInfo,
  clearLocalStorage,
  type UserPreferences,
} from "@/utils/localStorage";
import { DatabaseService } from "@/services/databaseService";
import CustomButton from "@/components/CustomButton";

interface GlobalSettingsModalProps {
  show: boolean;
  onClose: () => void;
}

const GlobalSettingsModal: React.FC<GlobalSettingsModalProps> = ({
  show,
  onClose,
}) => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [userPrefs, setUserPrefs] = useState<UserPreferences>(
    loadUserPreferences()
  );
  const [storageInfo, setStorageInfo] = useState(getStorageInfo());
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Refresh data when modal opens
  useEffect(() => {
    if (show) {
      setUserPrefs(loadUserPreferences());
      setStorageInfo(getStorageInfo());
    }
  }, [show]);

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = event.target.value as Theme;
    setTheme(newTheme);
  };

  const handleMaxTokensChange = (value: number) => {
    const newPrefs = { ...userPrefs, maxTokens: value };
    setUserPrefs(newPrefs);
    saveUserPreferences({ maxTokens: value });
  };

  const handleTemperatureChange = (value: number) => {
    const newPrefs = { ...userPrefs, temperature: value };
    setUserPrefs(newPrefs);
    saveUserPreferences({ temperature: value });
  };

  const handleExportData = () => {
    const data = exportAppData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `ttinteractive-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      // Clear all IndexedDB data
      await DatabaseService.clearAllData();

      // Clear all localStorage data
      clearLocalStorage();

      // Reset state
      setUserPrefs(loadUserPreferences());
      setStorageInfo(getStorageInfo());

      // Close modals
      setShowClearDataModal(false);

      // Optional: Show success message or reload page
      window.location.reload();
    } catch (error) {
      console.error("Error clearing data:", error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <GenericModal
        show={show}
        onClose={onClose}
        title={t("settings.title")}
        cancelText={t("common.close")}
      >
        <div className="space-y-6">
          {/* Language Settings */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-lg font-semibold">
                {t("settings.general")}
              </Label>
              <div className="space-y-3">
                <LanguageSelector />
              </div>
            </div>

            {/* Theme Settings */}
            <div>
              <Label
                htmlFor="theme-select"
                className="mb-2 block text-lg font-semibold"
              >
                {t("settings.appearance")}
              </Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="theme-select" className="mb-1 block text-sm">
                    {t("settings.theme")}
                  </Label>
                  <Select
                    id="theme-select"
                    value={theme}
                    onChange={handleThemeChange}
                    className="w-full"
                  >
                    <option value="light">{t("settings.themes.light")}</option>
                    <option value="dark">{t("settings.themes.dark")}</option>
                    <option value="auto">{t("settings.themes.auto")}</option>
                  </Select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t("settings.themeDescription")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div>
            <Label className="mb-2 block text-lg font-semibold">
              {t("settings.advanced")}
            </Label>
            <div className="space-y-3">
              <div>
                <Label
                  htmlFor="max-tokens-range"
                  className="mb-1 block text-sm"
                >
                  {t("settings.maxTokens")}: {userPrefs.maxTokens}
                </Label>
                <input
                  id="max-tokens-range"
                  name="max-tokens"
                  type="range"
                  min="100"
                  max="4000"
                  step="100"
                  value={userPrefs.maxTokens}
                  onChange={(e) =>
                    handleMaxTokensChange(parseInt(e.target.value))
                  }
                  className="w-full slider"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t("settings.maxTokensDescription")}
                </p>
              </div>
              <div>
                <Label
                  htmlFor="temperature-range"
                  className="mb-1 block text-sm"
                >
                  {t("chat.temperature")}: {userPrefs.temperature}
                </Label>
                <input
                  id="temperature-range"
                  name="temperature"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={userPrefs.temperature}
                  onChange={(e) =>
                    handleTemperatureChange(parseFloat(e.target.value))
                  }
                  className="w-full slider"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t("chat.temperatureDescription")}
                </p>
              </div>
            </div>
          </div>

          {/* API Keys Configuration */}
          <div>
            <Label className="mb-2 block text-lg font-semibold">
              {t("apiKeys.title")}
            </Label>
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <ApiKeyManager showTitle={false} className="space-y-4" />
            </div>
          </div>

          {/* Data Management */}
          <div>
            <Label className="mb-2 block text-lg font-semibold">
              {t("settings.dataManagement")}
            </Label>
            <div className="space-y-3">
              <div>
                <Label className="mb-1 block text-sm">
                  {t("settings.storageUsage")}
                </Label>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{
                      width: `${Math.min(storageInfo.percentage, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {(storageInfo.used / 1024).toFixed(1)}{" "}
                  {t("settings.storageDescription")} (
                  {storageInfo.percentage.toFixed(1)}%)
                </p>
              </div>
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <CustomButton
                    onClick={handleExportData}
                    variant="default"
                    className="w-full mb-3"
                  >
                    {t("settings.exportData")}
                  </CustomButton>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t("settings.exportDescription")}
                  </p>
                </div>
                <div>
                  <CustomButton
                    onClick={() => setShowClearDataModal(true)}
                    variant="alert"
                    className="w-full"
                  >
                    {t("settings.clearData")}
                  </CustomButton>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t("settings.clearDataDescription")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GenericModal>

      {/* Clear Data Confirmation Modal */}
      <ConfirmationModal
        show={showClearDataModal}
        onClose={() => setShowClearDataModal(false)}
        onConfirm={handleClearData}
        title={t("settings.clearData")}
        confirmText={t("common.confirm")}
        cancelText={t("common.cancel")}
        confirmColor="danger"
        loading={isClearing}
      >
        <p className="text-center">{t("settings.clearDataConfirmation")}</p>
      </ConfirmationModal>
    </>
  );
};

export default GlobalSettingsModal;
