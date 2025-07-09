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
    characterConversationBase: currentChat.characterConversationBase ?? "",
    characterInitialMessage:
      currentChat.characterInitialMessage?.join("\n\n") ?? "",
    characterImage: currentChat.characterImage ?? "",
    backgroundImage: currentChat.backgroundImage ?? "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const newFormData = {
      characterName: currentChat.characterName ?? "",
      characterConversationBase: currentChat.characterConversationBase ?? "",
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
      characterConversationBase: formData.characterConversationBase,
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
      characterConversationBase: currentChat.characterConversationBase ?? "",
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

          {/* Combined Preview Section */}
          {(formData.backgroundImage || formData.characterImage) && (
            <div className="w-full relative p-4 rounded-lg overflow-hidden min-h-[140px] flex items-center justify-center">
              {/* Background Image */}
              {formData.backgroundImage && (
                <>
                  <div
                    className="absolute inset-0 rounded-lg"
                    style={{
                      backgroundImage: `url(${formData.backgroundImage})`,
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
                {formData.characterImage && (
                  <img
                    src={formData.characterImage}
                    alt={formData.characterName || "Character preview"}
                    className="mx-auto object-cover w-16 h-16 mb-2 rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formData.characterName || "Character Name"}
                </p>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                  {t("characterManager.backgroundPreview")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Character Behavior */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="characterConversationBase">
              {t("characterManager.initialPrompt")}
            </Label>
            <Textarea
              id="characterConversationBase"
              value={formData.characterConversationBase}
              onChange={(e) =>
                handleInputChange("characterConversationBase", e.target.value)
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
