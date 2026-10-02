import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { ToastContainer } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "AI Photo Booth & Meme Studio",
  description: "Next-gen Photo Booth, Korean 4-Cut, AR Face Effects, Purikura & AI Creativity Studio",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-brand-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <Header />
          <Sidebar />
          <main className="flex-1 flex flex-col">{children}</main>
          <BottomNav />
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}

