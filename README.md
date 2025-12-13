# Cloud Sculptor Designs

A modern, secure e-commerce website for Cloud Sculptor Designs - featuring unique 3D printed art and collectibles.

## Features

- **Modern Next.js Architecture**: Built with Next.js 14+ and TypeScript for type safety and performance
- **Responsive Design**: Fully responsive UI with Tailwind CSS
- **Product Catalog**: Browse products with category filtering and search
- **Shopping Cart**: Full shopping cart functionality with Zustand state management
- **Secure Checkout**: Checkout flow ready for Stripe payment integration
- **Firebase Hosting**: Optimized for Firebase Hosting deployment
- **Security Headers**: Comprehensive security headers and best practices
- **SEO Optimized**: Meta tags and semantic HTML for better search engine visibility

## Tech Stack

- **Framework**: Next.js 14+ (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Hosting**: Firebase Hosting
- **CI/CD**: GitHub Actions
- **Icons**: Lucide React

## Project Structure

```
cloudsculptordesigns/
├── app/                      # Next.js App Router pages
│   ├── about/               # About page
│   ├── cart/                # Shopping cart page
│   ├── checkout/            # Checkout page
│   ├── contact/             # Contact page
│   ├── order-confirmation/  # Order confirmation page
│   ├── products/            # Products listing and detail pages
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/              # Reusable components
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── ProductCard.tsx
│   └── ProductGrid.tsx
├── data/                    # Product data
│   └── products.json
├── store/                   # State management
│   └── cartStore.ts
├── .github/workflows/       # GitHub Actions
│   └── deploy.yml
├── public/                  # Static assets
├── firebase.json            # Firebase configuration
├── next.config.mjs          # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase CLI: `npm install -g firebase-tools`
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/be269/cloudsculptordesigns.git
   cd cloudsculptordesigns
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your Firebase and Stripe credentials.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

```bash
npm install
npm run build
firebase deploy --only hosting
```

## Product Management

Products are stored in `/data/products.json`. To add or update products:

1. Edit `products.json`
2. Follow the existing product schema
3. Rebuild and redeploy

## Adding Product Images

1. Download images from your Etsy listings
2. Place them in `/public/images/products/`
3. Update the `image` field in `products.json` to match the filename
4. Recommended image size: 800x800px (square)
5. Supported formats: JPG, PNG, WebP

## Stripe Integration (Next Steps)

To enable payment processing:

1. Sign up for Stripe: [https://stripe.com](https://stripe.com)
2. Get API keys from the Stripe Dashboard
3. Add to environment variables
4. Implement Stripe Checkout in `/app/checkout/page.tsx`
5. Set up webhooks for order confirmation

## Security Features

- Content Security Policy (CSP) headers
- X-Frame-Options protection
- XSS Protection headers
- HTTPS enforcement
- Input validation and sanitization
- Secure environment variable handling

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `firebase deploy` - Deploy to Firebase Hosting

## Support

For issues or questions:
- Email: contact@cloudsculptordesigns.com
- Etsy: [https://cloudsculptordesigns.etsy.com](https://cloudsculptordesigns.etsy.com)

## License

Copyright © 2025 Cloud Sculptor Designs. All rights reserved.