import Link from "next/link";
import products from "@/data/products.json";
import ProductDetailClient from "@/components/ProductDetailClient";

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/products" className="text-primary-600 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}
