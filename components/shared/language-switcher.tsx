"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import styles from "./language-switcher.module.css";

type Language = {
  code: string;
  name: string;
  nativeName: string;
};

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
];

const LANGUAGE_STORAGE_KEY = "tanhio-language";

function urlLocaleFromPathname(pathname: string): string | undefined {
  const segments = pathname.split("/").filter(Boolean);
  const blogIndex = segments.indexOf("blog");
  if (blogIndex > 0 && languages.some((l) => l.code === segments[blogIndex - 1])) {
    return segments[blogIndex - 1];
  }
  return undefined;
}

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = useMemo(
    () => urlLocaleFromPathname(pathname) ?? localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? "en",
    [pathname],
  );

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  const switchLanguage = useCallback(
    (code: string) => {
      const lang = languages.find((l) => l.code === code);
      if (!lang) return;
      localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
      document.documentElement.lang = code;
      document.cookie = `${LANGUAGE_STORAGE_KEY}=${code}; path=/; max-age=31536000`;
      setIsOpen(false);

      const segments = pathname.split("/").filter(Boolean);
      const blogIndex = segments.indexOf("blog");
      if (blogIndex === -1) return;
      const localeIndex = blogIndex - 1;
      const hasLocale =
        localeIndex >= 0 && languages.some((l) => l.code === segments[localeIndex]);
      const next = hasLocale
        ? segments.map((s, i) => (i === localeIndex ? code : s))
        : [...segments.slice(0, blogIndex), code, ...segments.slice(blogIndex)];
      router.push(`/${next.join("/")}`);
    },
    [pathname, router],
  );

  const currentLanguage = languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <div
      className={cn(styles.wrapper, isOpen && styles.open)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-label="Switch language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
          if (e.key === "Escape") setIsOpen(false);
        }}
      >
        <span className={styles.code}>{currentLanguage.code.toUpperCase()}</span>
        <Languages className={styles.globe} size={14} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={styles.dropdown}
            role="listbox"
            aria-label="Available languages"
          >
            {languages.map((lang) => (
              <motion.li
                key={lang.code}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ delay: 0.02 }}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={lang.code === currentLang}
                  className={cn(
                    styles.option,
                    lang.code === currentLang && styles.active,
                  )}
                  onClick={() => switchLanguage(lang.code)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      switchLanguage(lang.code);
                    }
                  }}
                >
                  <>
                  <span className={styles.nativeName}>{lang.nativeName}</span>
                  <span className={styles.englishName}>{lang.name}</span>
                </>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LanguageSwitcher;
