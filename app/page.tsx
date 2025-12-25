import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="w-full" style={{ backgroundColor: '#161c29' }}>
      <Hero />

      {/* Tagline Banner */}
      <section className="py-6 px-4 md:px-8" style={{ backgroundColor: '#1e2739', borderBottom: '1px solid #2a3649' }}>
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6 md:gap-12 text-center">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" style={{ color: '#4A9FD4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span style={{ color: '#E8EDF5' }}>Fast 2-3 Day Shipping</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" style={{ color: '#4A9FD4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span style={{ color: '#E8EDF5' }}>Bulk Orders Welcome</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" style={{ color: '#4A9FD4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
            <span style={{ color: '#E8EDF5' }}>Custom Orders Available</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" style={{ color: '#4A9FD4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span style={{ color: '#E8EDF5' }}>Free Shipping $35+</span>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#E8EDF5' }}>
            Featured Collections
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#9BA8BE' }}>
            Explore our unique 3D printed designs - from anatomical art to mythical creatures
          </p>
        </div>

        <ProductGrid limit={8} />

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-block text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: '#4A9FD4' }}
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8" style={{ backgroundColor: '#1e2739', borderTop: '1px solid #2a3649' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(74, 159, 212, 0.15)', border: '1px solid rgba(74, 159, 212, 0.3)' }}
              >
                <svg className="w-8 h-8" style={{ color: '#6BB5E0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#E8EDF5' }}>Handmade Quality</h3>
              <p style={{ color: '#9BA8BE' }}>
                Each piece is carefully 3D printed and hand-finished with attention to detail
              </p>
            </div>

            <div className="text-center p-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(74, 159, 212, 0.15)', border: '1px solid rgba(74, 159, 212, 0.3)' }}
              >
                <svg className="w-8 h-8" style={{ color: '#6BB5E0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#E8EDF5' }}>Fast Turnaround</h3>
              <p style={{ color: '#9BA8BE' }}>
                Quick production on all orders. Large & bulk orders prioritized. Free shipping $35+
              </p>
            </div>

            <div className="text-center p-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgba(74, 159, 212, 0.15)', border: '1px solid rgba(74, 159, 212, 0.3)' }}
              >
                <svg className="w-8 h-8" style={{ color: '#6BB5E0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#E8EDF5' }}>Custom & Bulk Orders</h3>
              <p style={{ color: '#9BA8BE' }}>
                Custom prints, personalized designs, and bulk orders welcome. Contact us for quotes!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
