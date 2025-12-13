export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          About Cloud Sculptor Designs
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Our Story
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Cloud Sculptor Designs was born from a passion for bringing imagination to life through
              3D printing technology. Each piece we create is a unique fusion of art, science, and
              craftsmanship.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              What We Do
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We specialize in creating unique 3D printed sculptures, figurines, and functional art pieces.
              From anatomically accurate brain lamps to articulated dragon figurines, each item is carefully
              designed and hand-finished with attention to detail.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Anatomical Art & Educational Models</li>
              <li>Fantasy & Mythology Collectibles</li>
              <li>Articulated Fidget Toys</li>
              <li>Unique Home Decor</li>
              <li>Custom 3D Printed Designs</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Our Process
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Every piece begins with careful design and is produced using high-quality PLA plastic.
              We use state-of-the-art 3D printing technology combined with hand-finishing techniques
              to ensure each item meets our quality standards. Most items are made to order, ensuring
              freshness and allowing for custom color options.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Quality Commitment
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We stand behind every piece we create. Each item is inspected before shipping to ensure
              it meets our high standards. If you're not satisfied with your purchase, we're here to
              make it right.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
