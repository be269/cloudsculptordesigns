const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// We'll use a pre-rendered alien silhouette approach since server-side Three.js
// requires complex setup. Instead, we'll create a stylized alien shape.

// Color definitions (matching STLViewerInteractive.tsx)
const MATTE_COLORS = [
  { name: "Red", hex: "#ff0000" },
  { name: "Orange", hex: "#ff8000" },
  { name: "Yellow", hex: "#ffff00" },
  { name: "Lime", hex: "#80ff00" },
  { name: "Green", hex: "#00ff00" },
  { name: "Spring Green", hex: "#00ff80" },
  { name: "Cyan", hex: "#00ffff" },
  { name: "Sky Blue", hex: "#0080ff" },
  { name: "Blue", hex: "#0000ff" },
  { name: "Purple", hex: "#8000ff" },
  { name: "Magenta", hex: "#ff00ff" },
  { name: "Hot Pink", hex: "#ff0080" },
  { name: "Light Gray", hex: "#cccccc" },
  { name: "Gray", hex: "#808080" },
  { name: "Dark Gray", hex: "#333333" },
  { name: "White", hex: "#ffffff" },
  { name: "Brown", hex: "#996633" },
  { name: "Beige", hex: "#ffcc99" },
  { name: "Pink", hex: "#ffbfcc" },
  { name: "Maroon", hex: "#800000" },
  { name: "Teal", hex: "#008080" },
  { name: "Indigo", hex: "#800080" },
];

const METALLIC_COLORS = [
  { name: "Gold", hex: "#ffd700" },
  { name: "Silver", hex: "#c0c0c0" },
  { name: "Silk Red", hex: "#ff0000" },
  { name: "Silk Orange", hex: "#ff8000" },
  { name: "Silk Yellow", hex: "#ffff00" },
  { name: "Silk Lime", hex: "#80ff00" },
  { name: "Silk Green", hex: "#00ff00" },
  { name: "Silk Cyan", hex: "#00ffff" },
  { name: "Silk Blue", hex: "#0000ff" },
  { name: "Silk Purple", hex: "#8000ff" },
  { name: "Silk Magenta", hex: "#ff00ff" },
  { name: "Silk Pink", hex: "#ffbfcc" },
  { name: "Silk Teal", hex: "#008080" },
  { name: "Silk Indigo", hex: "#800080" },
];

const DUAL_COLORS = [
  { name: "Silk Red/Gold", hex1: "#ffcc00", hex2: "#ff3333" },
  { name: "Silk Green/Blue", hex1: "#00ff00", hex2: "#0000ff" },
  { name: "Silk Pink/Blue", hex1: "#ff69b4", hex2: "#00bfff" },
  { name: "Silk Gold/Silver", hex1: "#ffd700", hex2: "#c0c0c0" },
  { name: "Silk Copper/Gold", hex1: "#b87333", hex2: "#ffd700" },
  { name: "Silk Black/Gold", hex1: "#1a1a1a", hex2: "#ffd700" },
  { name: "Silk Black/Blue", hex1: "#1a1a1a", hex2: "#0066ff" },
  { name: "Silk Black/Green", hex1: "#1a1a1a", hex2: "#00cc00" },
  { name: "Silk Black/Purple", hex1: "#1a1a1a", hex2: "#9933ff" },
  { name: "Silk Pink/Gold", hex1: "#ff69b4", hex2: "#ffd700" },
  { name: "Silk Green/Purple", hex1: "#00cc00", hex2: "#9933ff" },
  { name: "Silk Red/Blue", hex1: "#ff3333", hex2: "#0066ff" },
];

const TRI_COLORS = [
  { name: "Gold/Silver/Copper", hex1: "#ffd700", hex2: "#c0c0c0", hex3: "#b87333" },
  { name: "Red/Blue/Green", hex1: "#ff3333", hex2: "#0066ff", hex3: "#00cc00" },
  { name: "Red/Gold/Purple", hex1: "#ff3333", hex2: "#ffd700", hex3: "#9933ff" },
  { name: "Orange/Blue/Green", hex1: "#ff6600", hex2: "#0066ff", hex3: "#00cc00" },
  { name: "Red/Yellow/Blue", hex1: "#ff3333", hex2: "#ffcc00", hex3: "#0066ff" },
  { name: "Blue/Green/Purple", hex1: "#0066ff", hex2: "#00cc00", hex3: "#9933ff" },
];

// Settings
const ALIEN_WIDTH = 70;
const ALIEN_HEIGHT = 90;
const LABEL_HEIGHT = 28;
const PADDING = 12;
const COLS_PER_ROW = 10;
const SECTION_PADDING = 25;

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function blendColors(hex1, hex2, t) {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r},${g},${b})`;
}

function drawAlien(ctx, x, y, color, isMetallic = false) {
  const { name, hex, hex1, hex2, hex3 } = color;
  const w = ALIEN_WIDTH;
  const h = ALIEN_HEIGHT;
  const cx = x + w / 2;

  ctx.save();

  // Create gradient for dual/tri colors (vertical)
  let fillStyle;
  if (hex3) {
    const gradient = ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, hex1);
    gradient.addColorStop(0.5, hex2);
    gradient.addColorStop(1, hex3);
    fillStyle = gradient;
  } else if (hex2 || hex1) {
    const gradient = ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, hex1 || hex);
    gradient.addColorStop(1, hex2 || hex);
    fillStyle = gradient;
  } else {
    fillStyle = hex;
  }

  // Draw alien head (large oval)
  const headCY = y + h * 0.35;
  const headRX = w * 0.45;
  const headRY = h * 0.35;

  ctx.beginPath();
  ctx.ellipse(cx, headCY, headRX, headRY, 0, 0, Math.PI * 2);
  ctx.fillStyle = fillStyle;
  ctx.fill();

  // Draw body (narrower oval below)
  const bodyCY = y + h * 0.75;
  const bodyRX = w * 0.28;
  const bodyRY = h * 0.22;

  ctx.beginPath();
  ctx.ellipse(cx, bodyCY, bodyRX, bodyRY, 0, 0, Math.PI * 2);
  ctx.fillStyle = fillStyle;
  ctx.fill();

  // Draw neck connecting head and body
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.15, y + h * 0.55);
  ctx.lineTo(cx + w * 0.15, y + h * 0.55);
  ctx.lineTo(cx + w * 0.2, y + h * 0.65);
  ctx.lineTo(cx - w * 0.2, y + h * 0.65);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();

  // Add 3D lighting effect - shadow on right side of head
  const headShadow = ctx.createRadialGradient(
    cx - headRX * 0.3, headCY - headRY * 0.2, 0,
    cx, headCY, headRX
  );
  headShadow.addColorStop(0, 'rgba(255,255,255,0.3)');
  headShadow.addColorStop(0.5, 'rgba(0,0,0,0)');
  headShadow.addColorStop(1, 'rgba(0,0,0,0.3)');

  ctx.beginPath();
  ctx.ellipse(cx, headCY, headRX, headRY, 0, 0, Math.PI * 2);
  ctx.fillStyle = headShadow;
  ctx.fill();

  // Add 3D lighting to body
  const bodyShadow = ctx.createRadialGradient(
    cx - bodyRX * 0.3, bodyCY - bodyRY * 0.2, 0,
    cx, bodyCY, bodyRX
  );
  bodyShadow.addColorStop(0, 'rgba(255,255,255,0.2)');
  bodyShadow.addColorStop(0.5, 'rgba(0,0,0,0)');
  bodyShadow.addColorStop(1, 'rgba(0,0,0,0.25)');

  ctx.beginPath();
  ctx.ellipse(cx, bodyCY, bodyRX, bodyRY, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyShadow;
  ctx.fill();

  // Metallic sheen
  if (isMetallic) {
    const shimmer = ctx.createLinearGradient(x, y, x + w, y + h);
    shimmer.addColorStop(0, 'rgba(255,255,255,0)');
    shimmer.addColorStop(0.45, 'rgba(255,255,255,0)');
    shimmer.addColorStop(0.5, 'rgba(255,255,255,0.4)');
    shimmer.addColorStop(0.55, 'rgba(255,255,255,0)');
    shimmer.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.beginPath();
    ctx.ellipse(cx, headCY, headRX, headRY, 0, 0, Math.PI * 2);
    ctx.fillStyle = shimmer;
    ctx.fill();
  }

  // Draw eyes (black ovals)
  const eyeY = headCY - headRY * 0.1;
  const eyeRX = headRX * 0.35;
  const eyeRY = headRY * 0.45;
  const eyeSpacing = headRX * 0.5;

  // Left eye
  ctx.beginPath();
  ctx.ellipse(cx - eyeSpacing, eyeY, eyeRX, eyeRY, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0a';
  ctx.fill();

  // Right eye
  ctx.beginPath();
  ctx.ellipse(cx + eyeSpacing, eyeY, eyeRX, eyeRY, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0a';
  ctx.fill();

  // Eye highlights
  ctx.beginPath();
  ctx.ellipse(cx - eyeSpacing - eyeRX * 0.2, eyeY - eyeRY * 0.2, eyeRX * 0.2, eyeRY * 0.15, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx + eyeSpacing - eyeRX * 0.2, eyeY - eyeRY * 0.2, eyeRX * 0.2, eyeRY * 0.15, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fill();

  ctx.restore();

  // Draw label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Word wrap for long names
  const maxWidth = ALIEN_WIDTH + PADDING;
  const words = name.split(/[\s\/]+/);
  let lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  const lineHeight = 12;
  const labelY = y + h + 4;
  lines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, cx, labelY + i * lineHeight);
  });
}

function drawSection(ctx, title, colors, startY, isMetallic = false) {
  // Draw section title
  ctx.fillStyle = '#4A9FD4';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(title, PADDING, startY);

  const colorsStartY = startY + 30;
  const rows = Math.ceil(colors.length / COLS_PER_ROW);
  const itemHeight = ALIEN_HEIGHT + LABEL_HEIGHT + PADDING;
  const itemWidth = ALIEN_WIDTH + PADDING;

  colors.forEach((color, i) => {
    const col = i % COLS_PER_ROW;
    const row = Math.floor(i / COLS_PER_ROW);
    const x = PADDING + col * itemWidth;
    const y = colorsStartY + row * itemHeight;
    drawAlien(ctx, x, y, color, isMetallic);
  });

  return colorsStartY + rows * itemHeight + SECTION_PADDING;
}

async function generateAlienSwatchImage() {
  // Calculate dimensions
  const matteRows = Math.ceil(MATTE_COLORS.length / COLS_PER_ROW);
  const metallicRows = Math.ceil(METALLIC_COLORS.length / COLS_PER_ROW);
  const dualRows = Math.ceil(DUAL_COLORS.length / COLS_PER_ROW);
  const triRows = Math.ceil(TRI_COLORS.length / COLS_PER_ROW);

  const itemHeight = ALIEN_HEIGHT + LABEL_HEIGHT + PADDING;
  const sectionHeaderHeight = 50;

  const totalHeight =
    PADDING + 50 + // Top padding + title
    sectionHeaderHeight + matteRows * itemHeight + SECTION_PADDING +
    sectionHeaderHeight + metallicRows * itemHeight + SECTION_PADDING +
    sectionHeaderHeight + dualRows * itemHeight + SECTION_PADDING +
    sectionHeaderHeight + triRows * itemHeight + PADDING;

  const totalWidth = COLS_PER_ROW * (ALIEN_WIDTH + PADDING) + PADDING * 2;

  // Create canvas
  const canvas = createCanvas(totalWidth, totalHeight);
  const ctx = canvas.getContext('2d');

  // Dark background with subtle gradient
  const bgGradient = ctx.createLinearGradient(0, 0, 0, totalHeight);
  bgGradient.addColorStop(0, '#1a2030');
  bgGradient.addColorStop(1, '#0d1218');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // Draw header
  ctx.fillStyle = '#E8EDF5';
  ctx.font = 'bold 26px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Cloud Sculptor Designs', totalWidth / 2, 35);

  ctx.font = '16px Arial';
  ctx.fillStyle = '#9BA8BE';
  ctx.fillText('Available Filament Colors', totalWidth / 2, 58);

  let currentY = 85;

  // Draw sections
  currentY = drawSection(ctx, 'Basic Colors (Matte Finish)', MATTE_COLORS, currentY, false);
  currentY = drawSection(ctx, 'Silk Colors (Metallic Sheen)', METALLIC_COLORS, currentY, true);
  currentY = drawSection(ctx, 'Dual-Color Silk (Gradient)', DUAL_COLORS.map(c => ({ ...c, hex: c.hex1 })), currentY, true);
  currentY = drawSection(ctx, 'Tri-Color Silk (3-Way Gradient)', TRI_COLORS.map(c => ({ ...c, hex: c.hex1 })), currentY, true);

  // Add footer note
  ctx.fillStyle = '#6B7280';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Note: Eyes will be black on actual prints (unless specified in order notes)', totalWidth / 2, currentY + 10);

  // Save image
  const outputDir = path.join(__dirname, '..', 'public', 'images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(outputDir, 'alien-color-swatches.png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`Alien color swatch image saved to: ${outputPath}`);
  console.log(`Dimensions: ${totalWidth}x${totalHeight}`);
  console.log(`Total colors: ${MATTE_COLORS.length + METALLIC_COLORS.length + DUAL_COLORS.length + TRI_COLORS.length}`);
}

generateAlienSwatchImage().catch(console.error);
