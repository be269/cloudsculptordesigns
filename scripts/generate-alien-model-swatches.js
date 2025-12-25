const fs = require('fs');
const path = require('path');
const { createCanvas, Image } = require('canvas');
const THREE = require('three');
const createContext = require('gl');
const { STLLoader } = require('three/examples/jsm/loaders/STLLoader.js');

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
const SWATCH_SIZE = 150;  // Increased size
const LABEL_HEIGHT = 32;
const PADDING = 16;
const GRID_BORDER = 2;    // Border thickness
const COLS_PER_ROW = 7;   // Fewer per row since they're bigger
const SECTION_PADDING = 30;

// Load the STL file
function loadSTL(filePath) {
  return new Promise((resolve, reject) => {
    const data = fs.readFileSync(filePath);
    const loader = new STLLoader();
    try {
      const geometry = loader.parse(data.buffer);
      resolve(geometry);
    } catch (error) {
      reject(error);
    }
  });
}

// Create a WebGL context using gl package
function createWebGLContext(width, height) {
  const gl = createContext(width, height, {
    preserveDrawingBuffer: true,
    antialias: true
  });

  // Create a mock canvas object that Three.js expects
  const canvas = {
    width,
    height,
    style: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    getContext: () => gl,
    clientWidth: width,
    clientHeight: height
  };

  return { gl, canvas };
}

// Render the alien model with a specific color
function renderAlien(geometry, color, isMetallic, width, height) {
  const { gl, canvas } = createWebGLContext(width, height);

  // Create Three.js renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    context: gl,
    antialias: true,
    preserveDrawingBuffer: true
  });
  renderer.setSize(width, height);
  renderer.setClearColor(0x161c29);

  // Create scene
  const scene = new THREE.Scene();

  // Create camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

  // Clone and prepare geometry
  const meshGeometry = geometry.clone();

  // Center and scale the geometry first to get yMin/yMax
  geometry.computeBoundingBox();
  const boundingBox = geometry.boundingBox;
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);

  meshGeometry.translate(-center.x, -center.y, -center.z);

  // Rotate geometry to face forward (before computing Y bounds)
  meshGeometry.rotateX(-Math.PI / 2);

  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const modelScale = 2 / maxDim;

  // Compute Y bounds after rotation for gradient
  meshGeometry.computeBoundingBox();
  const rotatedBox = meshGeometry.boundingBox;
  const yMin = rotatedBox.min.y;
  const yMax = rotatedBox.max.y;

  // Create material based on color type
  let material;
  const { hex, hex1, hex2, hex3 } = color;

  if (hex2 || hex1) {
    // Gradient shader material for dual/tri colors
    const color1 = new THREE.Color(hex1 || hex);
    const color2 = new THREE.Color(hex2 || hex);
    const color3 = hex3 ? new THREE.Color(hex3) : color2;

    material = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: color1 },
        color2: { value: color2 },
        color3: { value: color3 },
        hasColor3: { value: hex3 ? 1.0 : 0.0 },
        yMin: { value: yMin },
        yMax: { value: yMax },
        metalness: { value: isMetallic ? 0.8 : 0.1 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform float hasColor3;
        uniform float yMin;
        uniform float yMax;
        uniform float metalness;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          // Calculate gradient factor based on Y position
          float t = clamp((vPosition.y - yMin) / (yMax - yMin), 0.0, 1.0);

          vec3 baseColor;
          if (hasColor3 > 0.5) {
            // 3-color gradient: color1 at bottom, color2 in middle, color3 at top
            if (t < 0.5) {
              baseColor = mix(color1, color2, t * 2.0);
            } else {
              baseColor = mix(color2, color3, (t - 0.5) * 2.0);
            }
          } else {
            // 2-color gradient
            baseColor = mix(color1, color2, t);
          }

          // Simple lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.0);
          float ambient = 0.4;

          // Metallic sheen
          vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
          vec3 reflectDir = reflect(-lightDir, vNormal);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0) * metalness;

          vec3 finalColor = baseColor * (ambient + diff * 0.6) + vec3(spec);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  } else {
    material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hex),
      metalness: isMetallic ? 0.6 : 0.1,
      roughness: isMetallic ? 0.3 : 0.7
    });
  }

  // Create mesh (geometry already rotated)
  const mesh = new THREE.Mesh(meshGeometry, material);
  mesh.scale.set(modelScale, modelScale, modelScale);

  scene.add(mesh);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
  backLight.position.set(-5, 5, -5);
  scene.add(backLight);

  // Position camera - zoom in 2x to fill more of the box
  camera.position.set(0, 0, 1.75);
  camera.lookAt(0, 0, 0);

  // Render
  renderer.render(scene, camera);

  // Read pixels
  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  // Flip vertically (WebGL reads bottom-to-top)
  const flippedPixels = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = ((height - 1 - y) * width + x) * 4;
      const dstIdx = (y * width + x) * 4;
      flippedPixels[dstIdx] = pixels[srcIdx];
      flippedPixels[dstIdx + 1] = pixels[srcIdx + 1];
      flippedPixels[dstIdx + 2] = pixels[srcIdx + 2];
      flippedPixels[dstIdx + 3] = pixels[srcIdx + 3];
    }
  }

  // Clean up (avoid dispose() as it has issues in Node.js)
  material.dispose();

  return flippedPixels;
}

function drawSection(ctx, title, colors, startY, geometry, isMetallic = false, totalWidth, isFirst = false) {
  // Draw decorative separator line above section (except first)
  if (!isFirst) {
    const lineY = startY - 15;

    // Draw gradient line
    const gradient = ctx.createLinearGradient(PADDING * 2, lineY, totalWidth - PADDING * 2, lineY);
    gradient.addColorStop(0, 'rgba(74, 159, 212, 0)');
    gradient.addColorStop(0.1, 'rgba(74, 159, 212, 0.6)');
    gradient.addColorStop(0.5, 'rgba(74, 159, 212, 0.8)');
    gradient.addColorStop(0.9, 'rgba(74, 159, 212, 0.6)');
    gradient.addColorStop(1, 'rgba(74, 159, 212, 0)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PADDING * 2, lineY);
    ctx.lineTo(totalWidth - PADDING * 2, lineY);
    ctx.stroke();

    // Add subtle glow effect
    ctx.strokeStyle = 'rgba(74, 159, 212, 0.2)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(PADDING * 2, lineY);
    ctx.lineTo(totalWidth - PADDING * 2, lineY);
    ctx.stroke();
  }

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

    // Draw grid border/frame around the swatch
    ctx.strokeStyle = '#3a4659';
    ctx.lineWidth = GRID_BORDER;
    ctx.strokeRect(x - GRID_BORDER, y - GRID_BORDER, SWATCH_SIZE + GRID_BORDER * 2, SWATCH_SIZE + GRID_BORDER * 2);

    // Draw inner highlight border
    ctx.strokeStyle = '#2a3649';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, SWATCH_SIZE, SWATCH_SIZE);

    // Render the 3D model
    console.log(`  Rendering: ${color.name}`);
    const pixels = renderAlien(geometry, color, isMetallic, SWATCH_SIZE, SWATCH_SIZE);

    // Create ImageData and draw to canvas
    const imageData = ctx.createImageData(SWATCH_SIZE, SWATCH_SIZE);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, x, y);

    // Draw outer glow/border after the image
    ctx.strokeStyle = '#4a5a6f';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 1, y - 1, SWATCH_SIZE + 2, SWATCH_SIZE + 2);

    // Draw label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Word wrap for long names
    const maxWidth = SWATCH_SIZE + PADDING;
    const words = color.name.split(/[\s\/]+/);
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

    const lineHeight = 14;
    const labelY = y + SWATCH_SIZE + 6;
    lines.slice(0, 2).forEach((line, li) => {
      ctx.fillText(line, x + SWATCH_SIZE / 2, labelY + li * lineHeight);
    });
  });

  return colorsStartY + rows * itemHeight + SECTION_PADDING;
}

async function generateAlienSwatchImage() {
  console.log('Loading STL file...');
  const stlPath = path.join(__dirname, '..', 'public', 'models', 'Alien_1.stl');
  const geometry = await loadSTL(stlPath);
  console.log('STL loaded successfully');

  // Calculate dimensions
  const matteRows = Math.ceil(MATTE_COLORS.length / COLS_PER_ROW);
  const metallicRows = Math.ceil(METALLIC_COLORS.length / COLS_PER_ROW);
  const dualRows = Math.ceil(DUAL_COLORS.length / COLS_PER_ROW);
  const triRows = Math.ceil(TRI_COLORS.length / COLS_PER_ROW);

  const itemHeight = SWATCH_SIZE + LABEL_HEIGHT + PADDING;
  const sectionHeaderHeight = 50;

  const totalHeight =
    PADDING + 50 + // Top padding + title
    sectionHeaderHeight + matteRows * itemHeight + SECTION_PADDING +
    sectionHeaderHeight + metallicRows * itemHeight + SECTION_PADDING +
    sectionHeaderHeight + dualRows * itemHeight + SECTION_PADDING +
    sectionHeaderHeight + triRows * itemHeight + PADDING + 30;

  const totalWidth = COLS_PER_ROW * (SWATCH_SIZE + PADDING) + PADDING * 2;

  // Create canvas
  const canvas = createCanvas(totalWidth, totalHeight);
  const ctx = canvas.getContext('2d');

  // Dark background with subtle gradient
  ctx.fillStyle = '#161c29';
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
  console.log('Rendering Basic Colors...');
  currentY = drawSection(ctx, 'Basic Colors', MATTE_COLORS, currentY, geometry, false, totalWidth, true);

  console.log('Rendering Silk Colors...');
  currentY = drawSection(ctx, 'Silk Colors (Metallic Sheen)', METALLIC_COLORS, currentY, geometry, true, totalWidth);

  console.log('Rendering Dual-Color...');
  currentY = drawSection(ctx, 'Dual-Color Silk (Gradient)', DUAL_COLORS.map(c => ({ ...c, hex: c.hex1 })), currentY, geometry, true, totalWidth);

  console.log('Rendering Tri-Color...');
  currentY = drawSection(ctx, 'Tri-Color Silk (3-Way Gradient)', TRI_COLORS.map(c => ({ ...c, hex: c.hex1 })), currentY, geometry, true, totalWidth);

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
  const outputPath = path.join(outputDir, 'alien-model-swatches.png');
  fs.writeFileSync(outputPath, buffer);

  console.log(`\nAlien model swatch image saved to: ${outputPath}`);
  console.log(`Dimensions: ${totalWidth}x${totalHeight}`);
  console.log(`Total colors: ${MATTE_COLORS.length + METALLIC_COLORS.length + DUAL_COLORS.length + TRI_COLORS.length}`);
}

generateAlienSwatchImage().catch(console.error);
