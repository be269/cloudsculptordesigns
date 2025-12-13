import ProductCard from "./ProductCard";
import products from "@/data/products.json";

interface ProductGridProps {
  limit?: number;
  category?: string;
}

export default function ProductGrid({ limit, category }: ProductGridProps) {
  let filteredProducts = products;

  if (category) {
    filteredProducts = products.filter((p) => p.category === category);
  }

  if (limit) {
    filteredProducts = filteredProducts.slice(0, limit);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
