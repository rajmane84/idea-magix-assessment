import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { SessionProvider } from "@/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/shared/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prescripto - Online Prescription Platform",
  description: "Connect with doctors, consult, and manage prescriptions online.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-muted/30">
        <QueryProvider>
          <SessionProvider>
            <TooltipProvider>
              <Navbar />
              <main className="flex flex-1 flex-col">{children}</main>
              <Toaster richColors position="top-right" />
            </TooltipProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
