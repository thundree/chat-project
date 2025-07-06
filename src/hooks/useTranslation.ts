import { useState, useEffect } from "react";
import {
  getCurrentLocale,
  setLocale,
  t,
  type Locale,
  localeNames,
} from "@/locales";

export const useTranslation = () => {
  const [currentLocale, setCurrentLocale] = useState<Locale>(
    getCurrentLocale()
  );

  // Function to change locale
  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    setCurrentLocale(newLocale);
    // Trigger a re-render of components using this hook
    window.dispatchEvent(new Event("localechange"));
  };

  // Listen for locale changes from other components
  useEffect(() => {
    const handleLocaleChange = () => {
      setCurrentLocale(getCurrentLocale());
    };

    window.addEventListener("localechange", handleLocaleChange);
    return () => window.removeEventListener("localechange", handleLocaleChange);
  }, []);

  // Translation function that uses current locale
  const translate = (key: string) => t(key, currentLocale);

  return {
    locale: currentLocale,
    changeLocale,
    t: translate,
    localeNames,
  };
};

export default useTranslation;
