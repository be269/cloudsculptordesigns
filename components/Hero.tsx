import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-primary-600 to-primary-400 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Sculpting Dreams in 3D
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-50 max-w-3xl mx-auto">
            Discover unique, handcrafted 3D printed sculptures, dragons, and collectibles.
            Each piece is a work of art designed to inspire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white text-primary-600 hover:bg-primary-50 font-semibold px-8 py-3 rounded-lg transition-colors duration-200 inline-block"
            >
              Shop Now
            </Link>
            <Link
              href="/about"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold px-8 py-3 rounded-lg transition-colors duration-200 inline-block"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="currentColor"
            className="text-white dark:text-gray-900"
          />
        </svg>
      </div>
    </section>
  );
}
