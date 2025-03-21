import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import AuthProvider from "@/context/auth/provider";
import { EnvProvider } from "@/context/env/provider";
import { App } from "@/guards/app";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Supallm Dashboard",
  description:
    "Open-source AI flow builder that allows you to build and run AI flows in seconds.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <EnvProvider>
          <AuthProvider>
            <App>{children}</App>
          </AuthProvider>
        </EnvProvider>
      </body>
    </html>
  );
}
