import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "NexusChat – Modern Messaging",
  description: "A production-level chat application built with Next.js, TypeScript, and Tailwind CSS",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            {children}
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
