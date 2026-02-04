import type { Metadata } from "next";
import { Poppins, Noto_Sans_Devanagari, Alatsi } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-sans-devanagari",
  subsets: ["devanagari"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const alatsi = Alatsi({
  variable: "--font-alatsi",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "AuraMart - Premium Healthcare Marketplace",
  description: "Modern healthcare platform for appointments and prescriptions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${notoSansDevanagari.variable} ${alatsi.variable} antialiased bg-background text-foreground font-poppins`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
