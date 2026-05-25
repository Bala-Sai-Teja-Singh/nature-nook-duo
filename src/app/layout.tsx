import type { Metadata, Viewport } from "next";
import { Quicksand, Lora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { AppProvider } from "@/providers/app-provider";
import { ResponsiveToaster } from "@/components/shared/responsive-toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";

import { connectDB } from "@/lib/mongoose";
import { SystemSettingsModel } from "@/models";
import { ModuleProvider } from "@/providers/module-provider";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Nature's Nook Duo | Premium Pet Store",
  description: "Find Your Perfect Companion. Your premier destination for premium pets, supplies, and professional care guides.",
  keywords: ["pets", "pet store", "dogs", "cats", "birds", "exotic pets", "pet care"],
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialModules = undefined;
  try {
    await connectDB();
    const settings = await SystemSettingsModel.findById("default").lean();
    if (settings && settings.modules) {
      initialModules = settings.modules;
    }
  } catch (error) {
    console.error("Failed to fetch system settings in layout:", error);
  }

  return (
    <html
      lang="en"
      className={`${quicksand.variable} ${lora.variable} antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="antialiased font-sans bg-background text-foreground">
        <ThemeProvider>
          <TooltipProvider>
            <ModuleProvider initialModules={initialModules}>
              <AppProvider>
                <div className="flex min-h-[100dvh] flex-col relative overflow-x-hidden bg-nature-pattern">
                  <Navbar />
                  <main className="flex-1 flex flex-col z-10 w-full relative">
                    {children}
                  </main>
                  <Footer />
                </div>
                <ResponsiveToaster />
              </AppProvider>
            </ModuleProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
