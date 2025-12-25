import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1e2739', borderTop: '1px solid #2a3649' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <Image
                src="/images/logo.png"
                alt="Cloud Sculptor Designs"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-lg font-bold bg-gradient-to-r from-[#6BB5E0] to-[#4A9FD4] bg-clip-text text-transparent">
                Cloud Sculptor
              </span>
            </Link>
            <p className="text-sm" style={{ color: '#9BA8BE' }}>
              Unique 3D printed art and collectibles. Each piece is handcrafted with precision and creativity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#E8EDF5' }}>Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="transition-colors hover:text-[#4A9FD4]" style={{ color: '#9BA8BE' }}>
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-[#4A9FD4]" style={{ color: '#9BA8BE' }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-[#4A9FD4]" style={{ color: '#9BA8BE' }}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#E8EDF5' }}>Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=Dragons" className="transition-colors hover:text-[#4A9FD4]" style={{ color: '#9BA8BE' }}>
                  Dragons
                </Link>
              </li>
              <li>
                <Link href="/products?category=Sculptures" className="transition-colors hover:text-[#4A9FD4]" style={{ color: '#9BA8BE' }}>
                  Sculptures
                </Link>
              </li>
              <li>
                <Link href="/products?category=Lamps" className="transition-colors hover:text-[#4A9FD4]" style={{ color: '#9BA8BE' }}>
                  Lamps
                </Link>
              </li>
              <li>
                <Link href="/products?category=Aliens" className="transition-colors hover:text-[#4A9FD4]" style={{ color: '#9BA8BE' }}>
                  Aliens
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#E8EDF5' }}>Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://cloudsculptordesigns.etsy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#4A9FD4]"
                  style={{ color: '#9BA8BE' }}
                >
                  Etsy Shop
                </a>
              </li>
              <li>
                <a
                  href="mailto:brandon@cloudsculptordesigns.com"
                  className="transition-colors hover:text-[#4A9FD4]"
                  style={{ color: '#9BA8BE' }}
                >
                  brandon@cloudsculptordesigns.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 text-sm text-center" style={{ borderTop: '1px solid #2a3649', color: '#6B7A8F' }}>
          <p>&copy; {new Date().getFullYear()} Cloud Sculptor Designs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
