import { originalCharacters } from "@/data/originalCharacters";
import type { Character } from "@/types";
import CustomButton from "@/components/CustomButton";
import { useTranslation } from "@/hooks/useTranslation";

interface CharacterSelectProps {
  onSelect: (character: Character) => void;
}

export default function CharacterSelect({
  onSelect,
}: Readonly<CharacterSelectProps>) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
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
