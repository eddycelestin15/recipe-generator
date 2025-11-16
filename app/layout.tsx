import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import MobileHeader from "./components/MobileHeader";
import BottomNavigation from "./components/BottomNavigation";
import Footer from "./components/Footer";
import FitnessInitializer from "./components/FitnessInitializer";
import HabitsInitializer from "./components/HabitsInitializer";
import AIInsightsInitializer from "./components/AIInsightsInitializer";
import InstallPrompt from "./components/InstallPrompt";
import { cookies } from "next/headers";
import { getMessages } from "next-intl/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Recipe Health App - AI Recipe Generator & Smart Fridge",
    template: "%s | Recipe Health App"
  },
  description: "AI-powered recipe generator with health tracking, smart fridge management, and personalized nutrition. Create delicious recipes with ingredients you have, track your meals, and achieve your fitness goals.",
  applicationName: "Recipe Health App",
  keywords: ["recipe generator", "AI recipes", "health tracking", "nutrition", "smart fridge", "meal planning", "fitness", "diet"],
  authors: [{ name: "Recipe Health Team" }],
  creator: "Recipe Health Team",
  publisher: "Recipe Health Team",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RecipeHealth",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" }
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://recipehealth.app",
    title: "Recipe Health App - AI Recipe Generator & Smart Fridge",
    description: "AI-powered recipe generator with health tracking, smart fridge management, and personalized nutrition",
    siteName: "Recipe Health App",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recipe Health App - AI Recipe Generator",
    description: "AI-powered recipe generator with health tracking and smart fridge management",
  },
  icons: {
    icon: [
      { url: "/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // Important for iOS safe areas
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale from cookies or default to 'en'
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers locale={locale} messages={messages}>
          <FitnessInitializer />
          <HabitsInitializer />
          <AIInsightsInitializer />
          <InstallPrompt />
          <MobileHeader />
          <div className="content-with-nav flex flex-col min-h-screen">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
          <BottomNavigation />
        </Providers>
      </body>
    </html>
  );
}
