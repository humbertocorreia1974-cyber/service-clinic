import { JgnextAssistant } from "@/components/jgnext-assistant";
import CookieConsent from '@/components/cookie-consent';
import { AppNav } from "@/components/app-nav";
import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const body = Inter({ subsets: ["latin"], weight: ["400","700"], variable: "--font-sans", display: "swap" });
const display = Archivo({ subsets: ["latin"], weight: ["400","700"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "Service Clinic — Manutenção especializada para consultórios odontológicos",
  description: "Manutenção preventiva e corretiva de equipamentos odontológicos, higienização de ar-condicionado com laudo PMOC e revenda de peças. Atendemos Volta Redonda, Pinheiral, Barra Mansa, Resende e Barra do Piraí.",
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "Service Clinic",
    description: "Manutenção especializada para consultórios odontológicos no Sul Fluminense.",
    images: ["/og-image.png"],
  },
};

export const viewport = { width: 'device-width', initialScale: 1, maximumScale: 5 };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${body.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <Providers><AppNav />{children}</Providers>
              <JgnextAssistant />
        <CookieConsent />
      </body>
    </html>
  );
}
