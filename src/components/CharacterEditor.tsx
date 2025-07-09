import { useState, useEffect } from "react";
import { Label, Textarea, TextInput } from "flowbite-react";
import CustomButton from "@/components/CustomButton";
import { useTranslation } from "@/hooks/useTranslation";
import type { Character } from "@/types";

interface CharacterEditorProps {
  character?: Character;
  onSave: (
    character: Character,
    chatTitle?: string,
    temperature?: number
  ) => void;
  onCancel: () => void;
  isEditing?: boolean;
  chatTitle?: string;
  currentChat?: {
    userName?: string;
    temperature: number;
  };
  onUserNameChange?: (userName: string) => void;
  onTemperatureChange?: (temperature: number) => void;
}

const defaultCharacter: Omit<Character, "isOriginal"> = {
  name: "",
  description: "",
  roleInstruction: "",
  reminderMessage: "",
  characterInitialMessage: [""],
  avatarUrl: "",
  modelName: "good",
  maxTokensPerMessage: "400",
  fitMessagesInContextMethod: "summarizeOld",
  textEmbeddingModelName: "text-embedding-ada-002",
  autoGenerateMemories: "v1",
  avatarSize: "1",
  avatarShape: "square",
  sceneBackgroundUrl: "",
  sceneMusicUrl: "",
  userCharacterName: "Username",
  userCharacterAvatarUrl: "",
  loreBookUrlsText: "",
  customCode: "",
};

export default function CharacterEditor({
  character,
  onSave,
  onCancel,
  isEditing = false,
  chatTitle,
  currentChat,
  onUserNameChange,
  onTemperatureChange,
}: Readonly<CharacterEditorProps>) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Omit<Character, "isOriginal">>(
    () => ({
      ...defaultCharacter,
      ...character,
    })
  );
  const [currentChatTitle, setCurrentChatTitle] = useState<string>(
    chatTitle || (character ? `Chat with ${character.name}` : "")
  );
  const [userName, setUserName] = useState<string>(
    currentChat?.userName ?? character?.userCharacterName ?? "Username"
  );
  const [temperature, setTemperature] = useState<number>(
    currentChat?.temperature ?? 0.7
  );

  useEffect(() => {
    if (character) {
      setFormData({ ...defaultCharacter, ...character });
      setUserName(character?.userCharacterName ?? "Username");
    }
    if (chatTitle !== undefined) {
      setCurrentChatTitle(chatTitle);
    } else if (character) {
      setCurrentChatTitle(`Chat with ${character.name}`);
    }
    if (currentChat) {
      setUserName(currentChat.userName ?? "Username");
      setTemperature(currentChat.temperature);
    }
  }, [character, chatTitle, currentChat]);

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      return;
    }

    const chatWithCharacterToSave: Character = {
      ...formData,
      userCharacterName: userName, // Update the character's user name
      isOriginal: false, // Custom characters are not original
    };

    onSave(
      chatWithCharacterToSave,
      currentChatTitle.trim() || undefined,
      temperature
    );

    // If we have callback functions for user name and temperature, call them
    if (
      onUserNameChange &&
      userName !== (currentChat?.userName ?? character?.userCharacterName)
    ) {
      onUserNameChange(userName);
    }
    if (onTemperatureChange && temperature !== currentChat?.temperature) {
      onTemperatureChange(temperature);
    }
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemperature(parseFloat(e.target.value));
  };

  const isValid = formData.name.trim().length > 0;

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing
            ? t("characterEditor.editTitle")
            : t("characterEditor.createTitle")}
        </h2>
        <div className="flex gap-2">
          <CustomButton onClick={handleSave} disabled={!isValid}>
            {t("common.save")}
          </CustomButton>
          <CustomButton variant="gray" onClick={onCancel}>
            {t("common.cancel")}
          </CustomButton>
        </div>
      </div>

      {/* Chat Title Section */}
      <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
        <div>
          <Label htmlFor="chatTitle">{t("characterEditor.chatTitle")}</Label>
          <TextInput
            id="chatTitle"
            type="text"
            value={currentChatTitle}
            onChange={(e) => setCurrentChatTitle(e.target.value)}
            placeholder={t("characterEditor.chatTitlePlaceholder")}
            maxLength={128}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t("characterEditor.chatTitleDescription")}
          </p>
        </div>
      </div>

      {/* Chat Configuration Section */}
      <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Chat Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Name Field - only show when editing */}
          {isEditing && (
            <div className="">
              <Label htmlFor="user-name-input">{t("chat.userName")}</Label>
              <TextInput
                id="user-name-input"
                name="user-name"
                type="text"
                value={userName}
                onChange={handleUserNameChange}
                placeholder={t("chat.userNamePlaceholder")}
                maxLength={64}
              />
            </div>
          )}

          {/* Temperature Slider - always show */}
          <div className={isEditing ? "" : "md:col-span-2"}>
            <Label htmlFor="temperature-slider">
              {t("chat.temperature")}: {temperature}
            </Label>
            <input
              id="temperature-slider"
              name="temperature"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={temperature}
              onChange={handleTemperatureChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-1"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0 ({t("chat.temperatureLabels.focused")})</span>
              <span>0.5 ({t("chat.temperatureLabels.balanced")})</span>
              <span>1 ({t("chat.temperatureLabels.creative")})</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">{t("characterEditor.name")}</Label>
            <TextInput
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={t("characterEditor.namePlaceholder")}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">
              {t("characterEditor.description")}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={t("characterEditor.descriptionPlaceholder")}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="avatarUrl">{t("characterEditor.avatarUrl")}</Label>
            <TextInput
              id="avatarUrl"
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => handleInputChange("avatarUrl", e.target.value)}
              placeholder={t("characterEditor.avatarUrlPlaceholder")}
            />
          </div>

          <div>
            <Label htmlFor="sceneBackgroundUrl">
              {t("characterEditor.backgroundUrl")}
            </Label>
            <TextInput
              id="sceneBackgroundUrl"
              type="url"
              value={formData.sceneBackgroundUrl}
              onChange={(e) =>
                handleInputChange("sceneBackgroundUrl", e.target.value)
              }
              placeholder={t("characterEditor.backgroundUrlPlaceholder")}
            />
          </div>
        </div>

        {/* Character Behavior */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="roleInstruction">
              {t("characterEditor.roleInstruction")}
            </Label>
            <Textarea
              id="roleInstruction"
              value={formData.roleInstruction}
              onChange={(e) =>
                handleInputChange("roleInstruction", e.target.value)
              }
              placeholder={t("characterEditor.roleInstructionPlaceholder")}
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="reminderMessage">
              {t("characterEditor.reminderMessage")}
            </Label>
            <Textarea
              id="reminderMessage"
              value={formData.reminderMessage}
              onChange={(e) =>
                handleInputChange("reminderMessage", e.target.value)
              }
              placeholder={t("characterEditor.reminderMessagePlaceholder")}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="initialMessage">
              {t("characterEditor.initialMessage")}
            </Label>
            <Textarea
              id="initialMessage"
              value={formData.characterInitialMessage?.[0] ?? ""}
              onChange={(e) =>
                handleInputChange("characterInitialMessage", [e.target.value])
              }
              placeholder={t("characterEditor.initialMessagePlaceholder")}
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="flex w-full gap-6">
        {/* Avatar & Background Preview */}
        <div className="w-full relative p-4 rounded-lg overflow-hidden min-h-[140px] flex items-center justify-center">
          {/* Background Image */}
          {formData.sceneBackgroundUrl && (
            <>
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  backgroundImage: `url(${formData.sceneBackgroundUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />

              <div className="absolute inset-0 bg-white opacity-90 dark:hidden rounded-lg" />

              <div className="absolute inset-0 bg-gray-800 opacity-90 hidden dark:block rounded-lg" />
            </>
          )}

          {/* Content */}
          <div className="relative z-10 text-center">
            {formData.avatarUrl && (
              <img
                src={formData.avatarUrl}
                alt={formData.name || "Character preview"}
                className={`mx-auto object-cover w-16 h-16 mb-2 ${
                  formData.avatarShape === "square"
                    ? "rounded-lg"
                    : "rounded-full"
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formData.name || "Character Name"}
            </p>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
              {t("characterEditor.backgroundPreview")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
