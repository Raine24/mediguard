"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Copy, MessageCircle } from "lucide-react";

export default function ReferralLinkWidget({ link }: { link: string }) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(link, { margin: 2, scale: 5 })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error(err));
  }, [link]);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Hi! I use MedicINtime for my medication reminders and it has been amazing. Sign up using my link and never miss a dose again: ${link}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-8 items-center">
      {/* QR Code */}
      <div className="flex-shrink-0 bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center">
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="QR Code for Referral Link" className="w-32 h-32 mb-4" />
        ) : (
          <div className="w-32 h-32 bg-gray-200 animate-pulse mb-4 rounded-lg"></div>
        )}
        <a 
          href={qrCodeUrl} 
          download="MedicINtime-Referral-QR.png"
          className="text-teal-600 font-medium text-sm hover:text-teal-700 flex items-center gap-1"
        >
          <Download className="w-4 h-4" />
          Download QR
        </a>
      </div>

      {/* Link and Share */}
      <div className="flex-1 w-full text-center md:text-left">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Share Your Link</h3>
        <p className="text-gray-600 mb-6 text-sm">
          Give your friends and family the gift of perfect medication adherence. Share your link directly or let them scan your QR code.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
          <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg py-3 px-4 text-gray-700 font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap w-full">
            {link}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-teal-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </button>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-lg font-medium hover:bg-[#1ebd5b] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
