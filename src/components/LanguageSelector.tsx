import { useTranslation } from "@/hooks/useTranslation";
import type { Locale } from "@/locales";
import { Label } from "flowbite-react";

interface LanguageSelectorProps {
  readonly className?: string;
}

export default function LanguageSelector({
  className = "",
}: LanguageSelectorProps) {
  const { locale, changeLocale, localeNames, t } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLocale(e.target.value as Locale);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Label htmlFor="language-select" className="mb-1 block text-sm">
        {t("settings.language")}
      </Label>
      <select
        id="language-select"
        value={locale}
        onChange={handleLanguageChange}
        className="w-full max-w-xs p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
      >
        {Object.entries(localeNames).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
