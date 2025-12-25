import Link from "next/link";
import { Metadata } from "next";
import products from "@/data/products.json";
import ProductDetailClient from "@/components/ProductDetailClient";

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

// Generate SEO metadata for each product
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = products.find((p) => p.slug === params.slug);

  if (!product) {
    return {
      title: "Product Not Found | Cloud Sculptor Designs",
    };
  }

  // Build SEO-rich title and description
  const seoTitle = `${product.title} | Buy 3D Printed ${product.category} | Cloud Sculptor Designs`;
  const seoDescription = `${product.description} Only $${product.price}. Free shipping on orders $35+. Shop unique 3D printed ${product.category.toLowerCase()} at Cloud Sculptor Designs.`;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: `${product.title}, 3D printed ${product.category.toLowerCase()}, buy ${product.category.toLowerCase()}, ${product.category}, Cloud Sculptor Designs, 3D printed collectibles`,
    openGraph: {
      title: product.title,
      description: seoDescription,
      url: `https://cloudsculptordesigns.com/products/${product.slug}/`,
      siteName: "Cloud Sculptor Designs",
      images: [
        {
          url: `https://cloudsculptordesigns.com${product.image}`,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: seoDescription,
      images: [`https://cloudsculptordesigns.com${product.image}`],
    },
    alternates: {
      canonical: `https://cloudsculptordesigns.com/products/${product.slug}/`,
    },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) {
    return (
      <div className="min-h-screen bg-dark-700 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
          <Link href="/products" className="text-primary-400 hover:text-primary-300 transition-colors">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Product structured data for rich snippets
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: `https://cloudsculptordesigns.com${product.image}`,
    brand: {
      "@type": "Brand",
      name: "Cloud Sculptor Designs"
    },
    offers: {
      "@type": "Offer",
      url: `https://cloudsculptordesigns.com/products/${product.slug}/`,
      priceCurrency: "USD",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Cloud Sculptor Designs"
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: product.price >= 35 ? 0 : 7.99,
          currency: "USD"
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "WK"
          }
        }
      }
    },
    material: product.materials,
    category: product.category
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
