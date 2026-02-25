import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { KeyboardManager } from "@/components/keyboard-manager";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} overflow-hidden`}>
        <KeyboardManager />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
