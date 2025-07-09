import { useState, useEffect } from "react";
import { Label, Textarea, TextInput } from "flowbite-react";
import CustomButton from "@/components/CustomButton";
import { useTranslation } from "@/hooks/useTranslation";
import type { Character } from "@/types";

interface CharacterEditorProps {
  character?: Character;
  onSave: (character: Character, chatTitle?: string) => void;
  onCancel: () => void;
  isEditing?: boolean;
  chatTitle?: string;
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
  userCharacterName: "User",
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

  useEffect(() => {
    if (character) {
      setFormData({ ...defaultCharacter, ...character });
    }
    if (chatTitle !== undefined) {
      setCurrentChatTitle(chatTitle);
    } else if (character) {
      setCurrentChatTitle(`Chat with ${character.name}`);
    }
  }, [character, chatTitle]);

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

    const characterToSave: Character = {
      ...formData,
      isOriginal: false, // Custom characters are not original
    };

    onSave(characterToSave, currentChatTitle.trim() || undefined);
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
