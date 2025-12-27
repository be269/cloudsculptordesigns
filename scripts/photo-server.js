#!/usr/bin/env node
/**
 * Photo Manager Server
 * Run this alongside the dev server to enable photo uploads via the admin UI
 *
 * Usage: node scripts/photo-server.js
 * Then visit any product page and add ?admin=true to the URL
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.dirname(__dirname);
const PRODUCTS_JSON = path.join(PROJECT_DIR, 'data', 'products.json');
const IMAGES_DIR = path.join(PROJECT_DIR, 'public', 'images', 'products');

const PORT = 3001;

const server = http.createServer((req, res) => {
  // CORS headers for requests from localhost:3000
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // GET /products - list all products
  if (req.method === 'GET' && req.url === '/products') {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8'));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(products));
    return;
  }

  // POST /upload - upload photos for a product
  if (req.method === 'POST' && req.url.startsWith('/upload/')) {
    const slug = req.url.split('/upload/')[1];

    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
      try {
        const data = JSON.parse(Buffer.concat(body).toString());
        const result = addPhotosToProduct(slug, data.photos, data.setMainIndex);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // POST /upload-file - receive actual file data
  if (req.method === 'POST' && req.url.startsWith('/upload-file/')) {
    const parts = req.url.split('/');
    const slug = parts[2];
    const filename = decodeURIComponent(parts[3]);
    const isMain = req.url.includes('?main=true');

    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
      try {
        const result = saveUploadedFile(slug, filename, Buffer.concat(body), isMain);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (e) {
        console.error('Upload error:', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // DELETE /delete-photo - delete a photo from a product
  if (req.method === 'DELETE' && req.url.startsWith('/delete-photo/')) {
    const urlParts = req.url.split('/delete-photo/')[1].split('?');
    const slug = urlParts[0];
    const imagePath = decodeURIComponent(urlParts[1]?.replace('path=', '') || '');

    try {
      const result = deletePhoto(slug, imagePath);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (e) {
      console.error('Delete error:', e);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

function saveUploadedFile(slug, originalFilename, fileData, isMain) {
  // Load products
  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8'));
  const productIndex = products.findIndex(p => p.slug === slug);

  if (productIndex === -1) {
    throw new Error(`Product not found: ${slug}`);
  }

  const product = products[productIndex];
  const ext = path.extname(originalFilename).toLowerCase() || '.jpg';

  let destName;
  let webPath;

  if (isMain) {
    // Set as main image
    destName = `${slug}${ext}`;
    webPath = `/images/products/${destName}`;
    product.image = webPath;
    console.log(`  Set main image: ${destName}`);
  } else {
    // Add as additional image
    const existingImages = product.additionalImages || [];
    const nextNum = existingImages.length + 2;
    const numStr = String(nextNum).padStart(2, '0');
    destName = `${slug}-${numStr}${ext}`;
    webPath = `/images/products/${destName}`;

    if (!product.additionalImages) {
      product.additionalImages = [];
    }
    product.additionalImages.push(webPath);
    console.log(`  Added image: ${destName}`);
  }

  // Save the file
  const destPath = path.join(IMAGES_DIR, destName);
  fs.writeFileSync(destPath, fileData);

  // Save products.json
  products[productIndex] = product;
  fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(products, null, 4));

  return {
    success: true,
    path: webPath,
    product: {
      title: product.title,
      slug: product.slug,
      image: product.image,
      additionalImages: product.additionalImages || []
    }
  };
}

function deletePhoto(slug, imagePath) {
  // Load products
  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf8'));
  const productIndex = products.findIndex(p => p.slug === slug);

  if (productIndex === -1) {
    throw new Error(`Product not found: ${slug}`);
  }

  const product = products[productIndex];

  // Check if it's the main image
  if (product.image === imagePath) {
    // Can't delete main image, but can replace it
    throw new Error("Cannot delete main image. Use 'Replace Main Image' to change it.");
  }

  // Remove from additionalImages
  if (product.additionalImages) {
    const imageIndex = product.additionalImages.indexOf(imagePath);
    if (imageIndex > -1) {
      product.additionalImages.splice(imageIndex, 1);
      console.log(`  Removed from listing: ${imagePath}`);

      // Optionally delete the file (move to trash concept - we'll keep the file)
      // const filePath = path.join(PROJECT_DIR, 'public', imagePath);
      // if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }

  // Save products.json
  products[productIndex] = product;
  fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(products, null, 4));

  return {
    success: true,
    deleted: imagePath,
    product: {
      title: product.title,
      slug: product.slug,
      image: product.image,
      additionalImages: product.additionalImages || []
    }
  };
}

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           Cloud Sculptor Photo Manager Server              ║
╠════════════════════════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}                   ║
║                                                            ║
║  To add photos to a product:                               ║
║  1. Go to any product page on localhost:3000               ║
║  2. Add ?admin=true to the URL                             ║
║     Example: localhost:3000/products/dragon-egg/?admin=true║
║  3. Click the + button to add photos                       ║
║                                                            ║
║  Press Ctrl+C to stop                                      ║
╚════════════════════════════════════════════════════════════╝
`);
});
