import { useState, useEffect } from "react";
import { Label, Textarea, TextInput } from "flowbite-react";
import CustomButton from "@/components/CustomButton";
import { useTranslation } from "@/hooks/useTranslation";
import { useChat } from "@/contexts/useChat";
import type { Chat } from "@/types";

interface CharacterManagerProps {
  currentChat: Chat;
}

export default function CharacterManager({
  currentChat,
}: Readonly<CharacterManagerProps>) {
  const { t } = useTranslation();
  const { updateChat } = useChat();

  const [formData, setFormData] = useState({
    characterName: currentChat.characterName ?? "",
    characterInitialPrompt: currentChat.characterInitialPrompt ?? "",
    characterInitialMessage:
      currentChat.characterInitialMessage?.join("\n\n") ?? "",
    characterImage: currentChat.characterImage ?? "",
    backgroundImage: currentChat.backgroundImage ?? "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const newFormData = {
      characterName: currentChat.characterName ?? "",
      characterInitialPrompt: currentChat.characterInitialPrompt ?? "",
      characterInitialMessage:
        currentChat.characterInitialMessage?.join("\n\n") ?? "",
      characterImage: currentChat.characterImage ?? "",
      backgroundImage: currentChat.backgroundImage ?? "",
    };

    setFormData(newFormData);
    setHasChanges(false);
  }, [currentChat]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const updates: Partial<Chat> = {
      characterName: formData.characterName,
      characterInitialPrompt: formData.characterInitialPrompt,
      characterInitialMessage: formData.characterInitialMessage
        ? formData.characterInitialMessage
            .split("\n\n")
            .map((msg) => msg.trim())
            .filter(Boolean)
        : undefined,
      characterImage: formData.characterImage,
      backgroundImage: formData.backgroundImage,
    };

    await updateChat(currentChat.id, updates);
    setHasChanges(false);
  };

  const handleReset = () => {
    setFormData({
      characterName: currentChat.characterName ?? "",
      characterInitialPrompt: currentChat.characterInitialPrompt ?? "",
      characterInitialMessage:
        currentChat.characterInitialMessage?.join("\n\n") ?? "",
      characterImage: currentChat.characterImage ?? "",
      backgroundImage: currentChat.backgroundImage ?? "",
    });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("characterManager.title")}
        </h3>
        <div className="flex gap-2">
          <CustomButton onClick={handleSave} disabled={!hasChanges}>
            {t("common.save")}
          </CustomButton>

          {hasChanges && (
            <CustomButton variant="gray" onClick={handleReset}>
              {t("common.discard")}
            </CustomButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="characterName">
              {t("characterManager.characterName")}
            </Label>
            <TextInput
              id="characterName"
              type="text"
              value={formData.characterName}
              onChange={(e) =>
                handleInputChange("characterName", e.target.value)
              }
              placeholder={t("characterManager.characterNamePlaceholder")}
            />
          </div>

          <div>
            <Label htmlFor="backgroundImage">
              {t("characterManager.backgroundImage")}
            </Label>
            <TextInput
              id="backgroundImage"
              type="url"
              value={formData.backgroundImage}
              onChange={(e) =>
                handleInputChange("backgroundImage", e.target.value)
              }
              placeholder={t("characterManager.backgroundImagePlaceholder")}
            />
          </div>

          {/* Preview */}
          {formData.backgroundImage && (
            <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <img
                  src={`${
                    formData.backgroundImage
                  }?size=${new Date().getTime()}`} // Cache busting
                  alt={t("characterManager.backgroundPreview")}
                  className="mx-auto h-42 w-auto object-cover rounded-lg"
                />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {t("characterManager.backgroundPreview")}
                </p>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="characterImage">
              {t("characterManager.characterImage")}
            </Label>
            <TextInput
              id="characterImage"
              type="url"
              value={formData.characterImage}
              onChange={(e) =>
                handleInputChange("characterImage", e.target.value)
              }
              placeholder={t("characterManager.characterImagePlaceholder")}
            />
          </div>

          {/* Preview */}
          {formData.characterImage && (
            <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <img
                  src={`${
                    formData.characterImage
                  }?size=${new Date().getTime()}`} // Cache busting
                  alt={formData.characterName || "Character preview"}
                  className="mx-auto h-42 w-auto object-cover rounded-lg"
                />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {t("characterManager.characterPreview")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Character Behavior */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="characterInitialPrompt">
              {t("characterManager.initialPrompt")}
            </Label>
            <Textarea
              id="characterInitialPrompt"
              value={formData.characterInitialPrompt}
              onChange={(e) =>
                handleInputChange("characterInitialPrompt", e.target.value)
              }
              placeholder={t("characterManager.initialPromptPlaceholder")}
              rows={7}
            />
          </div>

          <div>
            <Label htmlFor="characterInitialMessage">
              {t("characterManager.initialMessage")}
            </Label>
            <Textarea
              id="characterInitialMessage"
              value={formData.characterInitialMessage}
              onChange={(e) =>
                handleInputChange("characterInitialMessage", e.target.value)
              }
              placeholder={t("characterManager.initialMessagePlaceholder")}
              rows={7}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
