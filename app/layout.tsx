import { JgnextAssistant } from "@/components/jgnext-assistant";
import CookieConsent from '@/components/cookie-consent';
import { AppNav } from "@/components/app-nav";
import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const body = Inter({ subsets: ["latin"], weight: ["400","700"], variable: "--font-sans", display: "swap" });
const display = Archivo({ subsets: ["latin"], weight: ["400","700"], variable: "--font-display", display: "swap" });

const SITE_URL = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://serviceclinic.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Service Clinic — Manutenção especializada para consultórios odontológicos",
  description: "Manutenção preventiva e corretiva de equipamentos odontológicos, higienização de ar-condicionado com laudo PMOC e revenda de peças. Atendemos Volta Redonda, Pinheiral, Barra Mansa, Resende e Barra do Piraí.",
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "Service Clinic",
    description: "Manutenção especializada para consultórios odontológicos no Sul Fluminense.",
    images: ["/og-image.png"],
    url: SITE_URL,
    siteName: "Service Clinic",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Service Clinic",
    description: "Manutenção especializada para consultórios odontológicos no Sul Fluminense.",
    images: ["/og-image.png"],
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Service Clinic",
  description: "Manutenção preventiva e corretiva de equipamentos odontológicos, higienização técnica de ar-condicionado em ambiente clínico com laudo PMOC e revenda de peças.",
  url: SITE_URL,
  telephone: "+5524999467392",
  image: `${SITE_URL}/og-image.png`,
  areaServed: [
    { "@type": "City", name: "Volta Redonda" },
    { "@type": "City", name: "Pinheiral" },
    { "@type": "City", name: "Barra Mansa" },
    { "@type": "City", name: "Resende" },
    { "@type": "City", name: "Barra do Piraí" },
  ],
  address: {
    "@type": "PostalAddress",
    addressRegion: "RJ",
    addressCountry: "BR",
  },
  priceRange: "$",
};

export const viewport = { width: 'device-width', initialScale: 1, maximumScale: 5 };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${body.variable} ${display.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Providers><AppNav />{children}</Providers>
              <JgnextAssistant />
        <CookieConsent />
      </body>
    </html>
  );
}
