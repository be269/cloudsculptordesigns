import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cloud Sculptor Designs - Unique 3D Printed Art & Collectibles",
  description: "Discover unique 3D printed sculptures, dragons, anatomical models, and collectibles. Handmade with precision and creativity.",
  keywords: "3D printing, sculptures, dragons, collectibles, anatomical models, figurines, art",
  authors: [{ name: "Cloud Sculptor Designs" }],
  openGraph: {
    title: "Cloud Sculptor Designs",
    description: "Unique 3D Printed Art & Collectibles",
    url: "https://www.cloudsculptordesigns.com",
    siteName: "Cloud Sculptor Designs",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
