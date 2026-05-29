import sharp from "sharp";
import { readFileSync } from "node:fs";

// public/icon.svg -> PWA ikonlari (PNG). Manuel calistir: node scripts/gen-icons.mjs
const svg = readFileSync(new URL("../public/icon.svg", import.meta.url));

const targets = [
  [512, "public/pwa-512.png"],
  [192, "public/pwa-192.png"],
  [180, "public/apple-touch-icon.png"],
];

for (const [size, out] of targets) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(out);
  console.log("wrote", out, size + "x" + size);
}
