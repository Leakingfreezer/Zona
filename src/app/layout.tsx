import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "GeoZones — Toronto Market Explorer",
  description: "Find the right location and market for your business in Toronto",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geist.variable} h-full font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
