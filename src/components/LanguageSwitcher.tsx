"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', flag: 'us' },
  { code: 'es', name: 'Español', flag: 'es' },
  { code: 'fr', name: 'Français', flag: 'fr' },
  { code: 'de', name: 'Deutsch', flag: 'de' },
  { code: 'hi', name: 'हिन्दी', flag: 'in' },
  { code: 'ar', name: 'العربية', flag: 'sa' },
  { code: 'pt', name: 'Português', flag: 'pt' },
  { code: 'bn', name: 'বাংলা', flag: 'bd' },
  { code: 'ru', name: 'Русский', flag: 'ru' },
  { code: 'ja', name: '日本語', flag: 'jp' },
  { code: 'zh-CN', name: '中文 (简体)', flag: 'cn' },
  { code: 'sw', name: 'Kiswahili', flag: 'tz' },
  { code: 'ur', name: 'اردو', flag: 'pk' },
  { code: 'id', name: 'Bahasa Indonesia', flag: 'id' },
  { code: 'it', name: 'Italiano', flag: 'it' },
  { code: 'nl', name: 'Nederlands', flag: 'nl' },
  { code: 'tr', name: 'Türkçe', flag: 'tr' },
  { code: 'pl', name: 'Polski', flag: 'pl' },
  { code: 'uk', name: 'Українська', flag: 'ua' },
  { code: 'ro', name: 'Română', flag: 'ro' },
  { code: 'el', name: 'Ελληνικά', flag: 'gr' },
  { code: 'hu', name: 'Magyar', flag: 'hu' },
  { code: 'cs', name: 'Čeština', flag: 'cz' },
  { code: 'sv', name: 'Svenska', flag: 'se' },
  { code: 'da', name: 'Dansk', flag: 'dk' },
  { code: 'fi', name: 'Suomi', flag: 'fi' },
  { code: 'no', name: 'Norsk', flag: 'no' },
  { code: 'he', name: 'עברית', flag: 'il' },
  { code: 'th', name: 'ไทย', flag: 'th' },
  { code: 'vi', name: 'Tiếng Việt', flag: 'vn' },
  { code: 'cy', name: 'Cymraeg', flag: 'gb' },
  { code: 'xh', name: 'isiXhosa', flag: 'za' },
  { code: 'yi', name: 'ייִדיש', flag: 'un' },
  { code: 'yo', name: 'Yorùbá', flag: 'ng' },
  { code: 'zu', name: 'isiZulu', flag: 'za' }
];

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export default function LanguageSwitcher() {
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(LANGUAGES[0]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Google Translate Element if not existing
    if (!document.getElementById("google_translate_element")) {
      const div = document.createElement("div");
      div.id = "google_translate_element";
      div.style.display = "none";
      document.body.appendChild(div);
    }

    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: LANGUAGES.map((l) => l.code).join(","),
              autoDisplay: false,
            },
            "google_translate_element"
          );
        }
      };

      if (!document.getElementById("google-translate-script")) {
        const script = document.createElement("script");
        script.id = "google-translate-script";
        script.type = "text/javascript";
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    // Check existing cookie for saved language preference
    const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]+)/);
    if (match && match[1]) {
      const parts = match[1].split("/");
      const langCode = parts[parts.length - 1];
      const found = LANGUAGES.find((l) => l.code.toLowerCase() === langCode.toLowerCase());
      if (found) {
        setSelectedLang(found);
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLanguage = (lang: LanguageOption) => {
    setSelectedLang(lang);
    setIsOpen(false);

    // Set googtrans cookie
    document.cookie = `googtrans=/en/${lang.code}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=/en/${lang.code}; path=/;`;

    // Trigger Google Translate Select
    const selectObj = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (selectObj) {
      selectObj.value = lang.code;
      selectObj.dispatchEvent(new Event("change"));
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left z-[100]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#0D3D56]/15 rounded-full hover:bg-slate-50 transition-all shadow-sm text-xs font-semibold text-[#1C1C1E]"
      >
        <img
          src={`https://flagcdn.com/w20/${selectedLang.flag}.png`}
          width="18"
          height="13"
          alt={selectedLang.name}
          className="rounded-[2px] object-cover"
          onError={(e) => {
            (e.target as HTMLElement).setAttribute(
              "src",
              "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxNSI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjE1IiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+"
            );
          }}
        />
        <span className="uppercase font-bold tracking-wider">{selectedLang.code.split("-")[0]}</span>
        <ChevronDown size={14} className={`text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 max-h-72 overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-[1000] scrollbar-thin">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelectLanguage(lang)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-xs text-left hover:bg-slate-50 font-medium transition-colors ${
                selectedLang.code === lang.code ? "bg-amber-50 text-amber-700 font-bold" : "text-slate-700"
              }`}
            >
              <img
                src={`https://flagcdn.com/w20/${lang.flag}.png`}
                width="18"
                height="13"
                alt={lang.name}
                className="rounded-[2px] object-cover shrink-0"
              />
              <span className="truncate">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
