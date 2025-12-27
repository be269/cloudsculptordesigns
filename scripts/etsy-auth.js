#!/usr/bin/env node

/**
 * Etsy OAuth Authorization Script
 *
 * This script helps you authorize your Etsy app to access your shop data.
 *
 * Usage:
 *   node scripts/etsy-auth.js          # Start local server and open auth URL
 *   node scripts/etsy-auth.js <code>   # Exchange auth code for access token (manual)
 */

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const ETSY_API_KEY = process.env.ETSY_API_KEY;
const ETSY_SHARED_SECRET = process.env.ETSY_SHARED_SECRET;
const PORT = 3333;

if (!ETSY_API_KEY) {
    console.error('Error: ETSY_API_KEY not found in .env.local');
    process.exit(1);
}

// Generate PKCE code verifier and challenge
function generatePKCE() {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    return { verifier, challenge };
}

// Store PKCE verifier for later use
const VERIFIER_FILE = path.join(__dirname, '.etsy-verifier');
const TOKEN_FILE = path.join(__dirname, '.etsy-token');

function startAuthServer() {
    const { verifier, challenge } = generatePKCE();

    // Save verifier for token exchange
    fs.writeFileSync(VERIFIER_FILE, verifier);

    // Use localhost for development - Etsy allows this
    const redirectUri = `http://localhost:${PORT}/callback`;

    const scopes = [
        'listings_r',   // Read listings
        'shops_r',      // Read shop info
        'transactions_r' // Read sales data
    ].join('%20');

    const authUrl = `https://www.etsy.com/oauth/connect?` +
        `response_type=code&` +
        `client_id=${ETSY_API_KEY}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${scopes}&` +
        `code_challenge=${challenge}&` +
        `code_challenge_method=S256&` +
        `state=cloudsculptor`;

    // Create a simple HTTP server to catch the callback
    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url, `http://localhost:${PORT}`);

        if (url.pathname === '/callback') {
            const code = url.searchParams.get('code');
            const state = url.searchParams.get('state');
            const error = url.searchParams.get('error');

            if (error) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end(`<h1>Authorization Failed</h1><p>Error: ${error}</p>`);
                server.close();
                process.exit(1);
            }

            if (code && state === 'cloudsculptor') {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                    <head><title>Etsy Authorization</title></head>
                    <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                        <h1>Authorization Successful!</h1>
                        <p>Exchanging code for access token...</p>
                        <p>You can close this window.</p>
                    </body>
                    </html>
                `);

                // Exchange the code for a token
                try {
                    await exchangeCodeForToken(code, redirectUri);
                    console.log('\n✓ Authorization complete! You can close the browser.');
                } catch (err) {
                    console.error('\nError exchanging code:', err.message);
                }

                server.close();
                process.exit(0);
            }
        }

        res.writeHead(404);
        res.end('Not found');
    });

    server.listen(PORT, () => {
        console.log('\n=== Etsy OAuth Authorization ===\n');
        console.log(`Callback server running on http://localhost:${PORT}`);
        console.log('\nOpening authorization URL in your browser...\n');
        console.log('If the browser doesn\'t open, visit this URL manually:');
        console.log(authUrl);
        console.log('\n');

        // Open the URL in Chrome (macOS)
        exec(`open -a "Google Chrome" "${authUrl}"`);
    });

    // Timeout after 5 minutes
    setTimeout(() => {
        console.log('\nTimeout: No authorization received after 5 minutes.');
        server.close();
        process.exit(1);
    }, 5 * 60 * 1000);
}

async function exchangeCodeForToken(authCode, customRedirectUri = null) {
    // Read the stored verifier
    if (!fs.existsSync(VERIFIER_FILE)) {
        console.error('Error: No PKCE verifier found. Run without arguments first to generate auth URL.');
        process.exit(1);
    }

    const verifier = fs.readFileSync(VERIFIER_FILE, 'utf8');
    const redirectUri = customRedirectUri || `http://localhost:${PORT}/callback`;

    const postData = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: ETSY_API_KEY,
        redirect_uri: redirectUri,
        code: authCode,
        code_verifier: verifier
    }).toString();

    console.log('Exchanging authorization code for access token...\n');

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.etsy.com',
            path: '/v3/public/oauth/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const token = JSON.parse(data);

                    // Save token
                    fs.writeFileSync(TOKEN_FILE, JSON.stringify(token, null, 2));

                    // Clean up verifier
                    fs.unlinkSync(VERIFIER_FILE);

                    console.log('Success! Access token saved to scripts/.etsy-token\n');
                    console.log(`Access Token: ${token.access_token.substring(0, 20)}...`);
                    console.log(`Token Type: ${token.token_type}`);
                    console.log(`Expires In: ${token.expires_in} seconds`);
                    console.log(`Refresh Token: ${token.refresh_token ? 'Yes' : 'No'}`);
                    console.log('\nYou can now run:');
                    console.log('  node scripts/etsy-sync.js --list');

                    // Update .env.local with the token
                    const envPath = path.join(__dirname, '..', '.env.local');
                    let envContent = fs.readFileSync(envPath, 'utf8');

                    if (envContent.includes('ETSY_ACCESS_TOKEN=')) {
                        envContent = envContent.replace(/ETSY_ACCESS_TOKEN=.*/g, `ETSY_ACCESS_TOKEN=${token.access_token}`);
                    } else {
                        envContent += `\nETSY_ACCESS_TOKEN=${token.access_token}`;
                    }

                    if (token.refresh_token) {
                        if (envContent.includes('ETSY_REFRESH_TOKEN=')) {
                            envContent = envContent.replace(/ETSY_REFRESH_TOKEN=.*/g, `ETSY_REFRESH_TOKEN=${token.refresh_token}`);
                        } else {
                            envContent += `\nETSY_REFRESH_TOKEN=${token.refresh_token}`;
                        }
                    }

                    fs.writeFileSync(envPath, envContent);
                    console.log('\n.env.local updated with access token.');

                    resolve(token);
                } else {
                    console.error(`Error ${res.statusCode}: ${data}`);
                    reject(new Error(data));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Main
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        startAuthServer();
    } else {
        await exchangeCodeForToken(args[0]);
    }
}

main().catch(console.error);
