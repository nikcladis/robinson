import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers";
import AuthErrorHandler from "@/shared/auth/error";
import BaseLayout from "@/shared/layout/base-layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hotel Reservation System",
  description: "Book your perfect stay with our hotel reservation system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-gray-50 flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <AuthErrorHandler />
          <BaseLayout>{children}</BaseLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
