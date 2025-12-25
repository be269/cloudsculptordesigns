export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 md:px-8" style={{ backgroundColor: '#161c29' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8" style={{ color: '#E8EDF5' }}>
          About Cloud Sculptor Designs
        </h1>

        <div className="rounded-lg shadow-lg p-8 space-y-8" style={{ backgroundColor: '#1e2739', border: '1px solid #2a3649' }}>
          <div>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#E8EDF5' }}>
              Our Story
            </h2>
            <p className="leading-relaxed" style={{ color: '#9BA8BE' }}>
              With over <span style={{ color: '#4A9FD4', fontWeight: '600' }}>10 years of 3D printing experience</span>,
              Cloud Sculptor Designs was born from a passion for bringing imagination to life through
              cutting-edge 3D printing technology. Each piece we create is a unique fusion of art, science, and
              craftsmanship.
            </p>
          </div>

          <blockquote
            className="text-xl italic py-6 px-8 rounded-lg"
            style={{ backgroundColor: 'rgba(74, 159, 212, 0.1)', borderLeft: '4px solid #4A9FD4', color: '#E8EDF5' }}
          >
            &ldquo;I love making things that make people happy.&rdquo;
            <footer className="text-sm mt-2 not-italic" style={{ color: '#9BA8BE' }}>— Brandon, Founder</footer>
          </blockquote>

          <div>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#E8EDF5' }}>
              What We Do
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: '#9BA8BE' }}>
              We specialize in creating unique 3D printed sculptures, figurines, and functional art pieces.
              From anatomically accurate brain lamps to articulated dragon figurines, each item is carefully
              designed and hand-finished with attention to detail.
            </p>
            <ul className="list-disc list-inside space-y-2" style={{ color: '#9BA8BE' }}>
              <li>Anatomical Art & Educational Models</li>
              <li>Fantasy & Mythology Collectibles</li>
              <li>Articulated Fidget Toys</li>
              <li>Unique Home Decor</li>
              <li>Custom 3D Printed Designs</li>
            </ul>
          </div>

          <div
            className="rounded-lg p-6"
            style={{ backgroundColor: 'rgba(74, 159, 212, 0.15)', border: '1px solid rgba(74, 159, 212, 0.3)' }}
          >
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#4A9FD4' }}>
              Custom & Large Orders
            </h2>
            <p className="leading-relaxed" style={{ color: '#E8EDF5' }}>
              We love doing custom and large orders! Whether you&apos;re looking for personalized gifts,
              promotional items, or bulk orders for your business, we&apos;ve got you covered.
            </p>
            <p className="mt-4 font-semibold" style={{ color: '#6BB5E0' }}>
              We can put your company name and/or logo on anything.
            </p>
            <p className="mt-4" style={{ color: '#9BA8BE' }}>
              Contact us to discuss your project and get a custom quote.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#E8EDF5' }}>
              Our Process
            </h2>
            <p className="leading-relaxed" style={{ color: '#9BA8BE' }}>
              Every piece begins with careful design and is produced using high-quality PLA plastic.
              We use state-of-the-art 3D printing technology combined with hand-finishing techniques
              to ensure each item meets our quality standards. Most items are made to order, ensuring
              freshness and allowing for custom color options.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#E8EDF5' }}>
              Quality Commitment
            </h2>
            <p className="leading-relaxed" style={{ color: '#9BA8BE' }}>
              We stand behind every piece we create. Each item is inspected before shipping to ensure
              it meets our high standards. If you&apos;re not satisfied with your purchase, we&apos;re here to
              make it right.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
