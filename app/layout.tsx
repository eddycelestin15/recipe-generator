import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navigation from "./components/Navigation";
import FitnessInitializer from "./components/FitnessInitializer";
import HabitsInitializer from "./components/HabitsInitializer";
import AIInsightsInitializer from "./components/AIInsightsInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recipe Health App - AI Recipe Generator & Smart Fridge",
  description: "AI-powered recipe generator with health tracking, smart fridge management, and personalized nutrition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <FitnessInitializer />
          <HabitsInitializer />
          <AIInsightsInitializer />
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
