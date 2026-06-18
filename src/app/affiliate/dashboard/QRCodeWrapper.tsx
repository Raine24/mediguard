"use client";

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Download } from 'lucide-react';

export default function QRCodeWrapper({ textToCopy, textForQR }: { textToCopy?: string, textForQR?: string }) {
  const [copied, setCopied] = useState(false);
  const [qrSrc, setQrSrc] = useState<string>('');

  useEffect(() => {
    if (textForQR) {
      QRCode.toDataURL(textForQR, { width: 150, margin: 1 }, (err, url) => {
        if (!err) setQrSrc(url);
      });
    }
  }, [textForQR]);

  const handleCopy = () => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (textForQR) {
    return (
      <div className="flex flex-col items-center">
        {qrSrc ? (
          <img src={qrSrc} alt="QR Code" className="w-32 h-32" />
        ) : (
          <div className="w-32 h-32 bg-slate-200 animate-pulse rounded-lg"></div>
        )}
        <a 
          href={qrSrc} 
          download="mediguard-qr.png"
          className="mt-2 text-sm flex items-center text-teal-600 hover:text-teal-700 font-medium"
        >
          <Download className="w-4 h-4 mr-1" /> Download
        </a>
      </div>
    );
  }

  if (textToCopy) {
    return (
      <button 
        onClick={handleCopy}
        className="bg-teal-600 hover:bg-teal-700 text-white rounded-r-lg px-6 py-3 flex items-center transition-colors border-y border-r border-teal-600"
      >
        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        <span className="ml-2 font-medium">{copied ? "Copied!" : "Copy"}</span>
      </button>
    );
  }

  return null;
}
