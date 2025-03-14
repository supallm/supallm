import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

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
    <ClerkProvider
      // Since clerk require to get this key at build time
      // we set a fake key, and then we will interpolate it
      // at runtime.
      publishableKey={"pk_test_cHJvbXB0LWNvcmFsLTcwLmNsZXJrLmFjY291bnRzLmRldiQ"}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <App>{children}</App>
        </body>
      </html>
    </ClerkProvider>
  );
}
