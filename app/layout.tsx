import type { Metadata, Viewport } from "next";
import { Nunito } from 'next/font/google'
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import CoinRain from "@/components/ui/CoinRain";

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: "Bolsillo — Control de gastos",
  description: "App de control de gastos e ingresos personales y compartidos",
  icons: {
    icon: "/logo-bolsillo.png",
    apple: "/logo-bolsillo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bolsillo",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={nunito.variable} suppressHydrationWarning>
      <body className="min-h-full antialiased">
        <CoinRain />
        <Providers>{children}</Providers>
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(() => {}); }`,
          }}
        />
      </body>
    </html>
  );
}
