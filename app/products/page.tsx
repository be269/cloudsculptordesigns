import { Metadata } from "next";
import ProductsPageClient from "@/components/ProductsPageClient";
import products from "@/data/products.json";

// SEO metadata for products listing page
export const metadata: Metadata = {
  title: "Shop 3D Printed Dragons & Custom Orders | Bulk Printing Available | Cloud Sculptor Designs",
  description: "Browse our 3D printed dragons, rockets & collectibles or request custom orders. Fast turnaround on bulk & large orders. Free shipping $35+.",
  keywords: "buy 3D printed dragons, custom 3D printing, bulk 3D print orders, wholesale 3D prints, articulated dragon for sale, BJD dragon, fast 3D printing, large orders, Cloud Sculptor Designs",
  openGraph: {
    title: "Shop 3D Printed Dragons & Collectibles | Cloud Sculptor Designs",
    description: "Browse articulated dragons, BJD figures, rockets, and unique 3D printed collectibles. Handmade with precision. Free shipping $35+.",
    url: "https://cloudsculptordesigns.com/products",
    siteName: "Cloud Sculptor Designs",
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
    title: "Shop 3D Printed Dragons & Collectibles",
    description: "Articulated dragons, BJD figures, rockets, and unique 3D printed collectibles.",
    images: ["https://cloudsculptordesigns.com/images/banner.png"],
  },
  alternates: {
    canonical: "https://cloudsculptordesigns.com/products",
  },
};

// Product collection structured data for rich snippets
const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "3D Printed Dragons, Rockets & Collectibles",
  description: "Shop our collection of unique 3D printed articulated dragons, ball jointed BJD dragons, flexi rockets, fidget toys, and fun collectibles.",
  url: "https://cloudsculptordesigns.com/products",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: products.length,
    itemListElement: products.slice(0, 10).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.title,
        description: product.description,
        image: `https://cloudsculptordesigns.com${product.image}`,
        url: `https://cloudsculptordesigns.com/products/${product.slug}/`,
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "USD",
          availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
      },
    })),
  },
};

export default function ProductsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <ProductsPageClient />
    </>
  );
}
