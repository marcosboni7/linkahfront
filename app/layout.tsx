import type { Metadata } from "next";
import { Poppins } from "next/font/google"; // Trocado Geist por Poppins
import "./globals.css";
import Script from "next/script";
import { LanguageProvider } from "./context/LanguageContext";

declare global {
  interface Window {
    google: any;
  }
}

// Configuração da Poppins
const poppins = Poppins({ 
  variable: "--font-poppins", 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"], // Pesos que você costuma usar nos cards
});

export const metadata: Metadata = {
  title: "Linkah - Produtor de Eventos",
  description: "Gerencie seus eventos e conecte-se com seu público.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`}>
        {/* Adicionei 'font-sans' para que a Poppins seja a fonte padrão de tudo */}
        <LanguageProvider>
          {children}
        </LanguageProvider>

        <Script
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDlGFav-T-Dig9xkdqpqfr98pJP8zmWbE8&libraries=places"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}