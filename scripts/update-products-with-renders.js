#!/usr/bin/env node
/**
 * Updates products.json:
 * - Products WITH existing photos: keep original as main, add render to additional
 * - Products WITHOUT photos (Alien 3, 4): use render as main
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '..', 'data', 'products.json');
const RENDERS_DIR = path.join(__dirname, '..', 'public', 'images', 'products', 'renders');

// Mapping from modelUrl to render file
const MODEL_TO_RENDER = {
    '/models/Alien_1.stl': '/images/products/renders/Alien_1_render.jpg',
    '/models/Alien_2.stl': '/images/products/renders/Alien_2_render.jpg',
    '/models/Alien_3.stl': '/images/products/renders/Alien_3_render.jpg',
    '/models/Alien_4.stl': '/images/products/renders/Alien_4_render.jpg',
    '/models/brain.stl': '/images/products/renders/brain_render.jpg',
    '/models/castle.stl': '/images/products/renders/castle_render.jpg',
    '/models/celtic_skull.stl': '/images/products/renders/celtic_skull_render.jpg',
    '/models/chinese_dragon.stl': '/images/products/renders/chinese_dragon_render.jpg',
    '/models/dragon_egg.stl': '/images/products/renders/dragon_egg_render.jpg',
    '/models/foo_lion.stl': '/images/products/renders/foo_lion_render.jpg',
    '/models/forest_goddess.stl': '/images/products/renders/forest_goddess_render.jpg',
    '/models/magic_lamp.stl': '/images/products/renders/magic_lamp_render.jpg',
    '/models/oni_wall_mask.stl': '/images/products/renders/oni_wall_mask_render.jpg',
    '/models/retro_rocket.stl': '/images/products/renders/retro_rocket_render.jpg',
    '/models/robot_hand.stl': '/images/products/renders/robot_hand_render.jpg',
    '/models/rocket_with_plume.stl': '/images/products/renders/rocket_with_plume_render.jpg',
};

// Products that have NO original photos - use render as main
const USE_RENDER_AS_MAIN = [
    'alien-visitor-3',
    'alien-visitor-4',
];

function main() {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));

    let updatedMain = 0;
    let addedToAdditional = 0;

    for (const product of products) {
        if (!product.modelUrl || !MODEL_TO_RENDER[product.modelUrl]) {
            continue;
        }

        const renderPath = MODEL_TO_RENDER[product.modelUrl];

        // Check if render exists
        const fullPath = path.join(__dirname, '..', 'public', renderPath);
        if (!fs.existsSync(fullPath)) {
            console.log(`Render not found: ${renderPath}`);
            continue;
        }

        // Initialize additionalImages if needed
        if (!product.additionalImages) {
            product.additionalImages = [];
        }

        // Remove render from additionalImages if present
        product.additionalImages = product.additionalImages.filter(img => !img.includes('_render'));

        if (USE_RENDER_AS_MAIN.includes(product.slug)) {
            // Use render as main image for products without original photos
            product.image = renderPath;
            console.log(`Using render as main for: ${product.title}`);
            updatedMain++;
        } else {
            // Keep original photo as main, check if we need to restore it
            if (product.image && product.image.includes('_render')) {
                // Current main is a render, need to find original
                // Look in additionalImages or construct from slug
                const originalInAdditional = product.additionalImages.find(img => !img.includes('_render'));
                if (originalInAdditional) {
                    product.image = originalInAdditional;
                    product.additionalImages = product.additionalImages.filter(img => img !== originalInAdditional);
                }
            }

            // Add render to additionalImages if not already there
            if (!product.additionalImages.includes(renderPath)) {
                product.additionalImages.unshift(renderPath);
                console.log(`Added render to additional for: ${product.title}`);
                addedToAdditional++;
            }
        }
    }

    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 4));

    console.log(`\nUpdated ${updatedMain} products with render as main`);
    console.log(`Added renders to ${addedToAdditional} products as additional images`);
}

main();
