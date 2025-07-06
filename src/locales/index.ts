import en from "./en.json";
import pt from "./pt.json";

export type Locale = "en" | "pt";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const locales: Record<Locale, any> = {
  en,
  pt,
};

export const localeNames: Record<Locale, string> = {
  en: "English",
  pt: "Português",
};

export const defaultLocale: Locale = "en";

// Get the current locale from localStorage or default
export const getCurrentLocale = (): Locale => {
  const saved = localStorage.getItem("locale");
  if (saved && (saved === "en" || saved === "pt")) {
    return saved as Locale;
  }

  // Try to detect from browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("pt")) {
    return "pt";
  }

  return defaultLocale;
};

// Save locale to localStorage
export const setLocale = (locale: Locale): void => {
  localStorage.setItem("locale", locale);
};

// Get nested translation value using dot notation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getNestedValue = (obj: any, path: string): string => {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : path;
  }, obj);
};

// Translation function
export const t = (key: string, locale?: Locale): string => {
  const currentLocale = locale ?? getCurrentLocale();
  const translations = locales[currentLocale];

  if (!translations) {
    console.warn(
      `Locale '${currentLocale}' not found, falling back to '${defaultLocale}'`
    );
    return getNestedValue(locales[defaultLocale], key);
  }

  const value = getNestedValue(translations, key);

  // If translation not found in current locale, fall back to default locale
  if (value === key && currentLocale !== defaultLocale) {
    console.warn(
      `Translation for '${key}' not found in '${currentLocale}', falling back to '${defaultLocale}'`
    );
    return getNestedValue(locales[defaultLocale], key);
  }

  return value;
};
