import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

declare global {
  interface Window {
    google: any;
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Linkah - Momentos que Conectam",
  description: "A plataforma para você encontrar as melhores experiências.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Script
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDlGFav-T-Dig9xkdqpqfr98pJP8zmWbE8&libraries=places"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}