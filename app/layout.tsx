import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import FitnessInitializer from "./components/FitnessInitializer";
import HabitsInitializer from "./components/HabitsInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Recipe Generator - Smart Fridge",
  description: "Générez des recettes avec l'IA et gérez votre frigo virtuel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FitnessInitializer />
        <HabitsInitializer />
        <Navigation />
        {children}
      </body>
    </html>
  );
}
