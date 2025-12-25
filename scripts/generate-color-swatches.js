const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

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
const SWATCH_SIZE = 80;
const LABEL_HEIGHT = 24;
const PADDING = 10;
const COLS_PER_ROW = 11;
const SECTION_PADDING = 20;

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getContrastColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

function drawSwatch(ctx, x, y, color, isMetallic = false) {
  const { name, hex, hex1, hex2, hex3 } = color;
  const cx = x + SWATCH_SIZE / 2;
  const cy = y + SWATCH_SIZE / 2;
  const radius = SWATCH_SIZE / 2 - 2;

  // Draw base circle with 3D sphere effect
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  // Base color or gradient
  if (hex3) {
    // Tri-color gradient (vertical for sphere effect)
    const gradient = ctx.createLinearGradient(x, y, x, y + SWATCH_SIZE);
    gradient.addColorStop(0, hex1);
    gradient.addColorStop(0.5, hex2);
    gradient.addColorStop(1, hex3);
    ctx.fillStyle = gradient;
  } else if (hex2 || hex1) {
    // Dual-color gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + SWATCH_SIZE);
    gradient.addColorStop(0, hex1 || hex);
    gradient.addColorStop(1, hex2 || hex);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = hex;
  }
  ctx.fillRect(x, y, SWATCH_SIZE, SWATCH_SIZE);

  // Add 3D sphere lighting - darker at edges
  const sphereShadow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  sphereShadow.addColorStop(0, 'rgba(0,0,0,0)');
  sphereShadow.addColorStop(0.7, 'rgba(0,0,0,0.1)');
  sphereShadow.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = sphereShadow;
  ctx.fillRect(x, y, SWATCH_SIZE, SWATCH_SIZE);

  // Add highlight (top-left light source)
  const highlight = ctx.createRadialGradient(
    cx - radius * 0.3, cy - radius * 0.3, 0,
    cx - radius * 0.3, cy - radius * 0.3, radius * 0.8
  );
  highlight.addColorStop(0, 'rgba(255,255,255,0.6)');
  highlight.addColorStop(0.3, 'rgba(255,255,255,0.2)');
  highlight.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = highlight;
  ctx.fillRect(x, y, SWATCH_SIZE, SWATCH_SIZE);

  // Add metallic sheen effect (subtle)
  if (isMetallic) {
    // Extra specular highlight for metallic - small bright spot
    const specular = ctx.createRadialGradient(
      cx - radius * 0.35, cy - radius * 0.35, 0,
      cx - radius * 0.35, cy - radius * 0.35, radius * 0.25
    );
    specular.addColorStop(0, 'rgba(255,255,255,0.5)');
    specular.addColorStop(0.6, 'rgba(255,255,255,0.15)');
    specular.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = specular;
    ctx.fillRect(x, y, SWATCH_SIZE, SWATCH_SIZE);
  }

  ctx.restore();

  // Draw border
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Add subtle outer glow
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 1, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Word wrap for long names
  const maxWidth = SWATCH_SIZE + PADDING;
  const words = name.split(' ');
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

  const lineHeight = 13;
  const labelY = y + SWATCH_SIZE + 4;
  lines.forEach((line, i) => {
    ctx.fillText(line, x + SWATCH_SIZE / 2, labelY + i * lineHeight);
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
  const itemHeight = SWATCH_SIZE + LABEL_HEIGHT + PADDING;
  const itemWidth = SWATCH_SIZE + PADDING;

  colors.forEach((color, i) => {
    const col = i % COLS_PER_ROW;
    const row = Math.floor(i / COLS_PER_ROW);
    const x = PADDING + col * itemWidth;
    const y = colorsStartY + row * itemHeight;
    drawSwatch(ctx, x, y, color, isMetallic);
  });

  return colorsStartY + rows * itemHeight + SECTION_PADDING;
}

async function generateSwatchImage() {
  // Calculate dimensions
  const matteRows = Math.ceil(MATTE_COLORS.length / COLS_PER_ROW);
  const metallicRows = Math.ceil(METALLIC_COLORS.length / COLS_PER_ROW);
  const dualRows = Math.ceil(DUAL_COLORS.length / COLS_PER_ROW);
  const triRows = Math.ceil(TRI_COLORS.length / COLS_PER_ROW);

  const itemHeight = SWATCH_SIZE + LABEL_HEIGHT + PADDING;
  const sectionHeaderHeight = 50;

  const totalHeight =
    PADDING + // Top padding
    sectionHeaderHeight + matteRows * itemHeight + SECTION_PADDING +
    sectionHeaderHeight + metallicRows * itemHeight + SECTION_PADDING +
    sectionHeaderHeight + dualRows * itemHeight + SECTION_PADDING +
    sectionHeaderHeight + triRows * itemHeight + PADDING;

  const totalWidth = COLS_PER_ROW * (SWATCH_SIZE + PADDING) + PADDING * 2;

  // Create canvas
  const canvas = createCanvas(totalWidth, totalHeight);
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = '#161c29';
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // Draw header
  ctx.fillStyle = '#E8EDF5';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Cloud Sculptor Designs - Color Options', totalWidth / 2, 30);

  let currentY = 60;

  // Draw sections
  currentY = drawSection(ctx, 'Basic Colors', MATTE_COLORS, currentY, false);
  currentY = drawSection(ctx, 'Silk Colors (Metallic Sheen)', METALLIC_COLORS, currentY, true);
  currentY = drawSection(ctx, 'Dual-Color Silk (Gradient)', DUAL_COLORS.map(c => ({ ...c, hex: c.hex1 })), currentY, true);
  currentY = drawSection(ctx, 'Tri-Color Silk (3-Way Gradient)', TRI_COLORS.map(c => ({ ...c, hex: c.hex1 })), currentY, true);

  // Save image
  const outputDir = path.join(__dirname, '..', 'public', 'images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(outputDir, 'color-swatches.png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`Color swatch image saved to: ${outputPath}`);
  console.log(`Dimensions: ${totalWidth}x${totalHeight}`);
  console.log(`Total colors: ${MATTE_COLORS.length + METALLIC_COLORS.length + DUAL_COLORS.length + TRI_COLORS.length}`);
}

generateSwatchImage().catch(console.error);
