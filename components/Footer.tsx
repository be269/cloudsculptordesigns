import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Cloud Sculptor Designs
            </h3>
            <p className="text-sm">
              Unique 3D printed art and collectibles. Each piece is handcrafted with precision and creativity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=Dragons" className="hover:text-white transition-colors">
                  Dragons
                </Link>
              </li>
              <li>
                <Link href="/products?category=Sculptures" className="hover:text-white transition-colors">
                  Sculptures
                </Link>
              </li>
              <li>
                <Link href="/products?category=Animals" className="hover:text-white transition-colors">
                  Animals
                </Link>
              </li>
              <li>
                <Link href="/products?category=Figurines" className="hover:text-white transition-colors">
                  Figurines
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://cloudsculptordesigns.etsy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Etsy Shop
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@cloudsculptordesigns.com"
                  className="hover:text-white transition-colors"
                >
                  Email Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Cloud Sculptor Designs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
