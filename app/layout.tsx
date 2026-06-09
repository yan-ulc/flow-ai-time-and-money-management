import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

import "@/components/themes/astro-vista.css";
import "@/components/themes/claude.css";
import "@/components/themes/light-green.css";
import "@/components/themes/mono.css";
import "@/components/themes/neobrutualism.css";
import "@/components/themes/notebook.css";
import "@/components/themes/supabase.css";
import "@/components/themes/vercel.css";
import "@/components/themes/whatsapp.css";
import "@/components/themes/zen.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowAi",
  description: "Track your money and time via chat.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FlowAi",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ClerkProvider>
            <ConvexClientProvider>
              {children}
              <Toaster richColors position="top-center" />
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
