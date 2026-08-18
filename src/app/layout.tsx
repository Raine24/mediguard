import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import "./globals.css";
import CookieConsent from "@/components/layout/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://medicintime.com"),
  title: {
    default: "MedicINtime | Smart WhatsApp Medication & Pill Reminders",
    template: "%s | MedicINtime",
  },
  description: "Never miss a dose again. MedicINtime delivers automated, personalized medication and pill reminders directly to your WhatsApp. No app download needed. Try free for 3 days!",
  keywords: [
    "medication reminder",
    "pill reminder",
    "whatsapp medicine reminder",
    "medicine alert system",
    "pill tracker",
    "elderly pill reminder",
    "caretaker medication reminder",
    "smart health",
    "MedicINtime",
  ],
  authors: [{ name: "MedicINtime Team", url: "https://medicintime.com" }],
  creator: "MedicINtime",
  publisher: "MedicINtime",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://medicintime.com",
  },
  openGraph: {
    title: "MedicINtime | Smart WhatsApp Medication & Pill Reminders",
    description: "Never miss a dose again. MedicINtime delivers automated, personalized medication and pill reminders directly to your WhatsApp. No app download needed.",
    url: "https://medicintime.com",
    siteName: "MedicINtime",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://medicintime.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "MedicINtime - Smart WhatsApp Medication Reminders",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MedicINtime | Smart WhatsApp Medication & Pill Reminders",
    description: "Never miss a dose again. MedicINtime delivers automated, personalized medication and pill reminders directly to your WhatsApp.",
    images: ["https://medicintime.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-3D1WGEF8ER" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3D1WGEF8ER');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://medicintime.com/#organization",
                  "name": "MedicINtime",
                  "url": "https://medicintime.com",
                  "logo": "https://i.ibb.co/t99SGFg/medicintime-logo.png",
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer support",
                    "email": "vashishttechnologies@gmail.com"
                  }
                },
                {
                  "@type": "WebSite",
                  "@id": "https://medicintime.com/#website",
                  "url": "https://medicintime.com",
                  "name": "MedicINtime",
                  "description": "Smart WhatsApp Medication & Pill Reminders",
                  "publisher": {
                    "@id": "https://medicintime.com/#organization"
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://medicintime.com/#software",
                  "name": "MedicINtime",
                  "applicationCategory": "HealthApplication",
                  "operatingSystem": "Web, Mobile, WhatsApp",
                  "offers": {
                    "@type": "AggregateOffer",
                    "lowPrice": "2.00",
                    "highPrice": "40.00",
                    "priceCurrency": "USD"
                  },
                  "description": "Never miss a dose again. MedicINtime delivers automated, personalized medication and pill reminders directly to your WhatsApp. No app download needed."
                }
              ]
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_live_Y2xlcmsubWVkaWNpbnRpbWUuY29tJA"}>
          {children}
          <CookieConsent />
        </ClerkProvider>
      </body>
    </html>
  );
}
