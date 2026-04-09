import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { LanguageProvider } from "./context/LanguageContext";

// Definição global para não dar erro de TypeScript ao usar window.google
declare global {
  interface Window {
    google: any;
  }
}

const poppins = Poppins({ 
  variable: "--font-poppins", 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Linkah - Produtor de Eventos",
  description: "Gerencie seus eventos e conecte-se com seu público.",
  icons: {
    icon: "/favicon.ico", // Certifique-se de ter esse arquivo na pasta public
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`} suppressHydrationWarning>
        <LanguageProvider>
          {children}
        </LanguageProvider>

        {/* DICA: Use strategy="afterInteractive" para carregar logo após a página ficar interativa.
          Removi o &loading=async da URL para deixar o Next.js controlar o carregamento.
        */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyDlGFav-T-Dig9xkdqpqfr98pJP8zmWbE8&libraries=places`}
          strategy="afterInteractive" 
        />
      </body>
    </html>
  );
}