import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cloud Sculptor Designs | 3D Printed Dragons, Custom Orders & Bulk Printing",
  description: "Shop unique 3D printed articulated dragons, BJD dragons, flexi rockets & collectibles. Custom orders welcome! Fast turnaround on bulk & large orders. Free shipping $35+.",
  keywords: "3D printed dragons, custom 3D printing, bulk 3D print orders, wholesale 3D prints, articulated dragon, ball jointed dragon, BJD dragon, fast 3D printing, large orders, Cloud Sculptor Designs",
  authors: [{ name: "Cloud Sculptor Designs" }],
  openGraph: {
    title: "Cloud Sculptor Designs | Custom 3D Printing & Bulk Orders",
    description: "Unique 3D printed dragons & collectibles. Custom orders welcome! Fast turnaround on bulk & large orders. Free shipping $35+.",
    url: "https://cloudsculptordesigns.com",
    siteName: "Cloud Sculptor Designs",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://cloudsculptordesigns.com/images/banner.png",
        width: 1200,
        height: 400,
        alt: "Cloud Sculptor Designs - 3D Printed Dragons and Collectibles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cloud Sculptor Designs | 3D Printed Dragons & Collectibles",
    description: "Unique 3D printed articulated dragons, BJD dragons, rockets, and fun collectibles.",
    images: ["https://cloudsculptordesigns.com/images/banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://cloudsculptordesigns.com",
  },
  verification: {
    google: "google-site-verification-code-here",
  },
};

// Organization structured data for rich snippets
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Cloud Sculptor Designs",
  url: "https://cloudsculptordesigns.com",
  logo: "https://cloudsculptordesigns.com/images/logo.png",
  description: "Unique 3D printed dragons & collectibles. Custom orders welcome! Fast turnaround on bulk & large orders.",
  sameAs: [
    "https://www.etsy.com/shop/CloudSculptorDesigns"
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "English"
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Cloud Sculptor Designs",
  url: "https://cloudsculptordesigns.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://cloudsculptordesigns.com/products?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${inter.className} text-gray-100`} style={{ backgroundColor: '#161c29' }}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
