#!/usr/bin/env node
/**
 * Quick photo adder for product listings
 *
 * Usage:
 *   node scripts/add-photos.js <search-term> <photo1.jpg> [photo2.jpg] ...
 *
 * Examples:
 *   node scripts/add-photos.js midgard ~/Desktop/serpent1.jpg ~/Desktop/serpent2.jpg
 *   node scripts/add-photos.js "dragon egg" photo1.jpg photo2.jpg photo3.jpg
 *   node scripts/add-photos.js rocket ~/Desktop/rocket.jpg
 *
 * The script will:
 *   1. Search for the product by name (partial match)
 *   2. Copy photos to public/images/products/ with proper naming
 *   3. Update products.json with the new additionalImages
 */

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.dirname(__dirname);
const PRODUCTS_JSON = path.join(PROJECT_DIR, 'data', 'products.json');
const IMAGES_DIR = path.join(PROJECT_DIR, 'public', 'images', 'products');

function usage() {
  console.log(`
Usage: node scripts/add-photos.js <search-term> <photo1> [photo2] ...

Search by product name (partial match, case-insensitive):
  node scripts/add-photos.js midgard ~/Desktop/photo1.jpg
  node scripts/add-photos.js "dragon egg" photo1.jpg photo2.jpg
  node scripts/add-photos.js rocket ~/Desktop/rocket.jpg

Options:
  --list     List all products
  --main     Set the first photo as the main image (replaces existing)
  `);
  process.exit(1);
}

function listProducts() {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8'));
  console.log('\nAll products:\n');
  products.forEach(p => {
    console.log(`  ${p.title}`);
    console.log(`    slug: ${p.slug}\n`);
  });
  console.log(`Total: ${products.length} products\n`);
  process.exit(0);
}

function findProduct(products, searchTerm) {
  const term = searchTerm.toLowerCase();

  // First try exact slug match
  let matches = products.filter(p => p.slug === term);
  if (matches.length === 1) return matches[0];

  // Then try partial slug match
  matches = products.filter(p => p.slug.includes(term));
  if (matches.length === 1) return matches[0];

  // Then try title match
  matches = products.filter(p => p.title.toLowerCase().includes(term));
  if (matches.length === 1) return matches[0];

  // Multiple matches - show them
  if (matches.length > 1) {
    console.log(`\nMultiple products match "${searchTerm}":\n`);
    matches.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title}`);
      console.log(`     slug: ${p.slug}\n`);
    });
    console.log('Be more specific or use the full slug.\n');
    process.exit(1);
  }

  // No matches
  return null;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    usage();
  }

  if (args[0] === '--list') {
    listProducts();
  }

  const setMain = args.includes('--main');
  const filteredArgs = args.filter(a => a !== '--main');

  if (filteredArgs.length < 2) {
    console.error('Error: Need a product name/slug and at least one photo');
    usage();
  }

  const searchTerm = filteredArgs[0];
  const photos = filteredArgs.slice(1);

  // Load products
  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8'));
  const product = findProduct(products, searchTerm);

  if (!product) {
    console.error(`\nNo product found matching "${searchTerm}"`);
    console.log('Use --list to see all products\n');
    process.exit(1);
  }

  const productIndex = products.findIndex(p => p.slug === product.slug);
  const slug = product.slug;

  console.log(`\nAdding photos to: ${product.title}`);
  console.log(`Slug: ${slug}\n`);

  // Determine existing image count for numbering
  const existingImages = product.additionalImages || [];
  let nextNum = existingImages.length + 2; // +2 because main image is -01 or no suffix

  const newImagePaths = [];

  photos.forEach((photoPath, i) => {
    const absPath = path.resolve(photoPath);

    if (!fs.existsSync(absPath)) {
      console.error(`Warning: File not found: ${absPath}`);
      return;
    }

    const ext = path.extname(absPath).toLowerCase() || '.jpg';
    let destName;
    let destPath;
    let webPath;

    if (setMain && i === 0) {
      // Set as main image
      destName = `${slug}${ext}`;
      destPath = path.join(IMAGES_DIR, destName);
      webPath = `/images/products/${destName}`;
      product.image = webPath;
      console.log(`  Main image: ${photoPath} -> ${destName}`);
    } else {
      // Add as additional image
      const num = String(nextNum).padStart(2, '0');
      destName = `${slug}-${num}${ext}`;
      destPath = path.join(IMAGES_DIR, destName);
      webPath = `/images/products/${destName}`;
      newImagePaths.push(webPath);
      nextNum++;
      console.log(`  Additional: ${photoPath} -> ${destName}`);
    }

    // Copy the file
    fs.copyFileSync(absPath, destPath);
  });

  // Update additionalImages
  if (newImagePaths.length > 0) {
    if (!product.additionalImages) {
      product.additionalImages = [];
    }
    product.additionalImages.push(...newImagePaths);
  }

  // Save products.json
  products[productIndex] = product;
  fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(products, null, 4));

  console.log(`\n✓ Updated products.json`);
  console.log(`✓ Product now has ${(product.additionalImages || []).length} additional images\n`);
}

main();
