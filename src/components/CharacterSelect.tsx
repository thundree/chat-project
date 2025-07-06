import { originalCharacters } from "@/data/originalCharacters";
import type { Character } from "@/types";
import CustomButton from "@/components/CustomButton";
import { useTranslation } from "@/hooks/useTranslation";
import { useState, Suspense, lazy } from "react";
import { HiPlus } from "react-icons/hi";

const CharacterEditor = lazy(() => import("@/components/CharacterEditor"));

interface CharacterSelectProps {
  onSelect: (character: Character) => void;
}

export default function CharacterSelect({
  onSelect,
}: Readonly<CharacterSelectProps>) {
  const { t } = useTranslation();
  const [showEditor, setShowEditor] = useState(false);

  const handleCreateCustom = () => {
    setShowEditor(true);
  };

  const handleSaveCustomCharacter = (character: Character) => {
    setShowEditor(false);
    onSelect(character);
  };

  const handleCancelEditor = () => {
    setShowEditor(false);
  };

  if (showEditor) {
    return (
      <Suspense fallback={<div>{t("mainContent.loading")}</div>}>
        <CharacterEditor
          onSave={handleSaveCustomCharacter}
          onCancel={handleCancelEditor}
        />
      </Suspense>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
      {/* Custom Character Creation Card */}
      <div className="flex flex-col items-center w-full p-3 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 hover:border-blue-400 dark:hover:border-blue-500">
        <div className="mb-3 flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full">
          <HiPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {t("characters.createCustom")}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center min-h-[40px] mb-6">
          {t("characters.createCustomDescription")}
        </p>

        <CustomButton onClick={handleCreateCustom}>
          {t("characters.create")}
        </CustomButton>
      </div>

      {/* Original Characters */}
      {originalCharacters.map((char) => (
        <div
          key={char.name}
          className="flex flex-col items-center w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          {char.avatarUrl && (
            <img
              src={char.avatarUrl}
              alt={char.name}
              className={`mb-3 object-cover ${
                char.avatarShape === "square" ? "rounded-lg" : "rounded-full"
              }`}
              style={{ width: 80, height: 80 }}
            />
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {char.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center min-h-[40px] mb-6">
            {char.description}
          </p>

          <CustomButton onClick={() => onSelect(char)}>
            {t("characters.select")}
          </CustomButton>
        </div>
      ))}
    </div>
  );
}
