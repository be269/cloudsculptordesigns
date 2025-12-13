# Deployment Guide for Cloud Sculptor Designs

This guide will walk you through deploying your Cloud Sculptor Designs website to Firebase Hosting.

## Prerequisites

Before you begin, ensure you have:

1. ✅ Node.js installed (version 18 or higher)
2. ✅ Git installed
3. ✅ A Firebase account
4. ✅ Firebase CLI installed globally

## Step 1: Install Node.js (if not already installed)

### macOS
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
```

### Verify installation
```bash
node --version  # Should show v18 or higher
npm --version   # Should show npm version
```

## Step 2: Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

## Step 3: Initial Setup

1. **Navigate to your project**:
   ```bash
   cd /Users/brandonbutler/cloudsculptordesigns
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

## Step 4: Configure Firebase

1. **Login to Firebase**:
   ```bash
   firebase login
   ```
   This will open a browser window for authentication.

2. **Verify your project is connected**:
   ```bash
   firebase projects:list
   ```
   You should see `cloud-sculptor-designs` in the list.

## Step 5: Set Up Environment Variables

1. **Create environment file**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Get Firebase credentials**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `cloud-sculptor-designs`
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - If no web app exists, click "Add app" and select Web (</>)
   - Copy the configuration values

3. **Edit `.env.local`**:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cloud-sculptor-designs.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=cloud-sculptor-designs
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cloud-sculptor-designs.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

## Step 6: Add Product Images

Before building, you should add your product images:

1. **Create images directory**:
   ```bash
   mkdir -p public/images/products
   ```

2. **Download images from Etsy**:
   - Go to each product listing on Etsy
   - Download the main product image
   - Rename to match the slug (e.g., `brain-lamp.jpg`)
   - Save to `public/images/products/`

3. **Or use placeholders** for now and add images later

## Step 7: Build the Application

```bash
npm run build
```

This will create an optimized production build in the `out` directory.

**Expected output**:
- You should see a success message
- An `out` folder should be created

## Step 8: Test Locally (Optional)

Before deploying, test the production build locally:

```bash
# Install a simple HTTP server
npm install -g serve

# Serve the built application
serve out

# Open http://localhost:3000 in your browser
```

## Step 9: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

**Expected output**:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/cloud-sculptor-designs/overview
Hosting URL: https://cloud-sculptor-designs.web.app
```

🎉 **Your site is now live!**

## Step 10: Configure Custom Domain

To use `www.cloudsculptordesigns.com`:

1. **Add domain in Firebase Console**:
   - Go to Firebase Console > Hosting
   - Click "Add custom domain"
   - Enter `cloudsculptordesigns.com`
   - Follow the verification steps

2. **Update DNS records** at your domain registrar:
   - Add the A records provided by Firebase
   - Wait for DNS propagation (can take up to 48 hours)

3. **Firebase will automatically provision SSL certificate**

## Step 11: Set Up GitHub Secrets for Auto-Deployment

To enable automatic deployments when you push to GitHub:

1. **Get Firebase service account key**:
   ```bash
   firebase projects:list
   ```

   Then get the service account JSON:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file

2. **Add secrets to GitHub**:
   - Go to your GitHub repository: https://github.com/be269/cloudsculptordesigns
   - Click Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Add these secrets:
     - `FIREBASE_SERVICE_ACCOUNT`: Paste entire service account JSON
     - `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your auth domain
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: cloud-sculptor-designs
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your storage bucket
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your sender ID
     - `NEXT_PUBLIC_FIREBASE_APP_ID`: Your app ID

3. **Enable GitHub Actions**:
   - Go to repository > Actions tab
   - Enable workflows if prompted

4. **Test auto-deployment**:
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

   Check the Actions tab to see the deployment progress.

## Updating Your Site

### Method 1: Manual Deployment

```bash
# Make your changes
npm run build
firebase deploy --only hosting
```

### Method 2: Auto-Deployment (if GitHub Actions configured)

```bash
git add .
git commit -m "Your update message"
git push origin main
```

The site will automatically deploy!

## Troubleshooting

### Build fails
- Check Node.js version: `node --version` (should be 18+)
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Next.js cache: `rm -rf .next`

### Firebase deploy fails
- Verify you're logged in: `firebase login --reauth`
- Check project: `firebase use cloud-sculptor-designs`
- Verify `out` directory exists: `ls out/`

### Images not showing
- Ensure images are in `public/images/products/`
- Check file names match `products.json`
- Rebuild after adding images: `npm run build`

### Custom domain not working
- DNS can take up to 48 hours to propagate
- Verify DNS records match Firebase requirements
- Check SSL certificate status in Firebase Console

## Maintenance

### Regular Updates

1. **Update dependencies monthly**:
   ```bash
   npm update
   npm audit fix
   ```

2. **Rebuild and redeploy**:
   ```bash
   npm run build
   firebase deploy
   ```

### Adding New Products

1. Edit `data/products.json`
2. Add product images to `public/images/products/`
3. Rebuild and deploy
4. Changes go live immediately

## Support

If you encounter issues:

1. Check Firebase Console for errors
2. Check GitHub Actions logs (if using auto-deploy)
3. Review build logs: `npm run build`
4. Email: contact@cloudsculptordesigns.com

## Quick Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Check code quality

# Firebase
firebase login           # Login to Firebase
firebase deploy          # Deploy everything
firebase deploy --only hosting  # Deploy only hosting
firebase hosting:channel:deploy preview  # Deploy to preview

# Git
git status              # Check changes
git add .               # Stage changes
git commit -m "message" # Commit changes
git push origin main    # Push to GitHub
```

## Next Steps

- [ ] Add all product images
- [ ] Set up Stripe for payments
- [ ] Configure custom domain
- [ ] Set up Google Analytics
- [ ] Add customer reviews
- [ ] Implement email notifications
- [ ] Create admin dashboard for product management

---

**Congratulations!** Your Cloud Sculptor Designs website is now live! 🚀
