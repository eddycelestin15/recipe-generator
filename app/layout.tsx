import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import MobileHeader from "./components/MobileHeader";
import BottomNavigation from "./components/BottomNavigation";
import { Sidebar } from "./components/Sidebar";
import { RightSidebar } from "./components/RightSidebar";
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // Important for iOS safe areas
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

          {/* Mobile Header - Hidden on desktop */}
          <div className="lg:hidden">
            <MobileHeader />
          </div>

          {/* Desktop Layout with Sidebars */}
          <Sidebar />
          <RightSidebar />

          {/* Main Content Area */}
          <div className="content-with-nav lg:content-with-sidebar">
            <div className="lg:ml-[280px] xl:mr-[320px]">
              <div className="mx-auto max-w-[600px] lg:border-x lg:border-border lg:min-h-screen">
                {children}
              </div>
            </div>
          </div>

          {/* Bottom Navigation - Hidden on desktop */}
          <div className="lg:hidden">
            <BottomNavigation />
          </div>
        </Providers>
      </body>
    </html>
  );
}
