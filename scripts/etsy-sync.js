#!/usr/bin/env node

/**
 * Etsy Sync Script
 *
 * Syncs product data from Etsy API to local products.json
 *
 * Usage:
 *   node scripts/etsy-sync.js --list          # List all shop listings
 *   node scripts/etsy-sync.js --sync          # Sync prices and inventory
 *   node scripts/etsy-sync.js --images <id>   # Download images for a listing
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const ETSY_API_KEY = process.env.ETSY_API_KEY;
const PRODUCTS_PATH = path.join(__dirname, '..', 'data', 'products.json');
const IMAGES_PATH = path.join(__dirname, '..', 'public', 'images', 'products');

if (!ETSY_API_KEY) {
    console.error('Error: ETSY_API_KEY not found in .env.local');
    process.exit(1);
}

// Etsy API base URL
const ETSY_API_BASE = 'https://openapi.etsy.com/v3';

/**
 * Make a request to the Etsy API
 */
function etsyRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const url = `${ETSY_API_BASE}${endpoint}`;
        const options = {
            headers: {
                'x-api-key': ETSY_API_KEY,
                'Accept': 'application/json'
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`API Error ${res.statusCode}: ${data}`));
                }
            });
        }).on('error', reject);
    });
}

/**
 * Get shop info by shop name
 */
async function getShopByName(shopName) {
    try {
        const data = await etsyRequest(`/application/shops?shop_name=${encodeURIComponent(shopName)}`);
        return data.results?.[0];
    } catch (error) {
        console.error('Error fetching shop:', error.message);
        return null;
    }
}

/**
 * Get active listings for a shop
 */
async function getShopListings(shopId, limit = 100) {
    try {
        const data = await etsyRequest(`/application/shops/${shopId}/listings/active?limit=${limit}`);
        return data.results || [];
    } catch (error) {
        console.error('Error fetching listings:', error.message);
        return [];
    }
}

/**
 * Get listing details including images
 */
async function getListingDetails(listingId) {
    try {
        const data = await etsyRequest(`/application/listings/${listingId}?includes=Images`);
        return data;
    } catch (error) {
        console.error(`Error fetching listing ${listingId}:`, error.message);
        return null;
    }
}

/**
 * Get images for a listing
 */
async function getListingImages(listingId) {
    try {
        const data = await etsyRequest(`/application/listings/${listingId}/images`);
        return data.results || [];
    } catch (error) {
        console.error(`Error fetching images for ${listingId}:`, error.message);
        return [];
    }
}

/**
 * Download an image from a URL
 */
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(filepath);
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {}); // Delete partial file
            reject(err);
        });
    });
}

/**
 * List all shop listings
 */
async function listListings() {
    console.log('Fetching shop information...\n');

    // Try to find the shop by name
    const shop = await getShopByName('CloudSculptorDesigns');

    if (!shop) {
        console.log('Could not find shop. Trying to fetch listings directly...');
        // Try using listing IDs from products.json
        const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));

        console.log('\nChecking listings from products.json:\n');
        for (const product of products.slice(0, 5)) {
            console.log(`Checking listing ${product.id}: ${product.title}`);
            const details = await getListingDetails(product.id);
            if (details) {
                console.log(`  Price: $${(details.price.amount / details.price.divisor).toFixed(2)}`);
                console.log(`  Quantity: ${details.quantity}`);
            }
        }
        return;
    }

    console.log(`Shop: ${shop.shop_name}`);
    console.log(`Shop ID: ${shop.shop_id}`);
    console.log(`Active Listings: ${shop.listing_active_count}\n`);

    const listings = await getShopListings(shop.shop_id);

    console.log('Active Listings:');
    console.log('─'.repeat(80));

    for (const listing of listings) {
        const price = listing.price ? (listing.price.amount / listing.price.divisor).toFixed(2) : 'N/A';
        console.log(`ID: ${listing.listing_id}`);
        console.log(`Title: ${listing.title}`);
        console.log(`Price: $${price}`);
        console.log(`Quantity: ${listing.quantity}`);
        console.log('─'.repeat(80));
    }
}

/**
 * Sync prices and inventory from Etsy to products.json
 */
async function syncProducts() {
    console.log('Syncing products from Etsy...\n');

    const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
    let updated = 0;

    for (const product of products) {
        const listingId = product.id;
        console.log(`Checking ${product.title} (${listingId})...`);

        const details = await getListingDetails(listingId);

        if (details) {
            const etsyPrice = details.price.amount / details.price.divisor;
            const etsyQuantity = details.quantity;

            let changed = false;

            if (product.price !== etsyPrice) {
                console.log(`  Price: $${product.price} → $${etsyPrice}`);
                product.price = etsyPrice;
                changed = true;
            }

            if (product.stock !== etsyQuantity) {
                console.log(`  Stock: ${product.stock} → ${etsyQuantity}`);
                product.stock = etsyQuantity;
                changed = true;
            }

            if (changed) {
                updated++;
            } else {
                console.log('  No changes');
            }
        } else {
            console.log('  Could not fetch from Etsy');
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
    }

    if (updated > 0) {
        fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 4));
        console.log(`\nUpdated ${updated} products in products.json`);
    } else {
        console.log('\nNo products needed updating');
    }
}

/**
 * Download images for a specific listing
 */
async function downloadListingImages(listingId) {
    console.log(`Downloading images for listing ${listingId}...\n`);

    const images = await getListingImages(listingId);

    if (images.length === 0) {
        console.log('No images found for this listing');
        return;
    }

    // Find the product to get slug for naming
    const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
    const product = products.find(p => p.id === listingId);
    const baseName = product?.slug || listingId;

    console.log(`Found ${images.length} images\n`);

    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const ext = 'jpg';
        const filename = i === 0
            ? `${baseName}.${ext}`
            : `${baseName}-${String(i).padStart(2, '0')}.${ext}`;
        const filepath = path.join(IMAGES_PATH, filename);

        // Use the full resolution URL
        const imageUrl = image.url_fullxfull || image.url_570xN;

        console.log(`Downloading ${filename}...`);
        try {
            await downloadImage(imageUrl, filepath);
            console.log(`  Saved to ${filepath}`);
        } catch (error) {
            console.log(`  Error: ${error.message}`);
        }
    }

    console.log('\nDone!');
}

// Main CLI handler
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--list') || args.includes('-l')) {
        await listListings();
    } else if (args.includes('--sync') || args.includes('-s')) {
        await syncProducts();
    } else if (args.includes('--images') || args.includes('-i')) {
        const idIndex = args.findIndex(a => a === '--images' || a === '-i');
        const listingId = args[idIndex + 1];
        if (!listingId) {
            console.error('Please provide a listing ID: --images <listing_id>');
            process.exit(1);
        }
        await downloadListingImages(listingId);
    } else {
        console.log('Etsy Sync Script');
        console.log('');
        console.log('Usage:');
        console.log('  node scripts/etsy-sync.js --list          List all shop listings');
        console.log('  node scripts/etsy-sync.js --sync          Sync prices and inventory');
        console.log('  node scripts/etsy-sync.js --images <id>   Download images for a listing');
    }
}

main().catch(console.error);
