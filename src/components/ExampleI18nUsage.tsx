// Example usage of the i18n system
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSelector from "@/components/LanguageSelector";

export default function ExampleI18nUsage() {
  const { t, locale } = useTranslation();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{t("settings.title")}</h1>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">
          Current Language: {locale}
        </h2>
        <LanguageSelector />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Sample Translations:</h3>
        <ul className="space-y-1">
          <li>
            <strong>Common Save:</strong> {t("common.save")}
          </li>
          <li>
            <strong>Chat Title:</strong> {t("chat.title")}
          </li>
          <li>
            <strong>Temperature:</strong> {t("chat.temperature")}
          </li>
          <li>
            <strong>API Keys:</strong> {t("apiKeys.title")}
          </li>
          <li>
            <strong>OpenAI Key:</strong> {t("apiKeys.openai.title")}
          </li>
          <li>
            <strong>Provider Title:</strong> {t("providers.title")}
          </li>
          <li>
            <strong>Models:</strong> {t("models.title")}
          </li>
          <li>
            <strong>Free Tier:</strong> {t("models.tiers.free")}
          </li>
          <li>
            <strong>Premium Tier:</strong> {t("models.tiers.premium")}
          </li>
        </ul>
      </div>

      <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">How It Works:</h3>
        <ul className="text-sm space-y-1">
          <li>• Language preference is saved in localStorage</li>
          <li>• Automatic fallback to English if translation missing</li>
          <li>• Real-time language switching</li>
          <li>• Browser language detection on first visit</li>
        </ul>
      </div>
    </div>
  );
}
