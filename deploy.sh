#!/bin/bash
cd "$(dirname "$0")"
echo "Building..."
npm run build
echo "Deploying to Firebase..."
firebase deploy --only hosting
echo "Done!"
