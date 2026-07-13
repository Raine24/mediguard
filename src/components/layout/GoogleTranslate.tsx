"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

export default function GoogleTranslate() {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          { 
            pageLanguage: "en",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
          },
          "google_translate_element"
        );
      }
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.type = "text/javascript";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* Container for the Google Translate dropdown, shown when expanded */}
      <div 
        className={`transition-all duration-300 ease-in-out origin-bottom-right ${
          isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div 
          className="bg-white p-3 rounded-2xl shadow-2xl border border-gray-200 min-w-[160px]"
          id="google_translate_element"
        ></div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 border-4 border-white"
        title="Translate Page"
      >
        <Globe className="w-6 h-6" />
      </button>

      {/* Styles to fix Google Translate's messy UI injections */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Hide the top Google banner */
        .skiptranslate iframe { display: none !important; }
        body { top: 0px !important; }
        
        /* Style the select dropdown */
        .goog-te-combo {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          outline: none;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          background-color: white;
          width: 100%;
          cursor: pointer;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        
        /* Hide the Google branding */
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { color: transparent !important; font-size: 0px !important; }
      `}} />
    </div>
  );
}
