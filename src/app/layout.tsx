import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "MBAUnlocked | India's Premium MBA Interview Transcripts",
  description: "Find your exact match. Read interview transcripts from top IIMs and other b-schools based on your exact profile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="animate-fade-in">
        <Navbar />
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
