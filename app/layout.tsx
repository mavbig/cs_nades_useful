import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { KeyboardManager } from "@/components/keyboard-manager";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CS2 Nades Useful",
  description: "Steam Overlay optimized nade tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${fontSans.variable} font-sans antialiased overflow-hidden`}>
        <KeyboardManager />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
