import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages proje sitesi alt-yolda yayinlanir: https://fabricpro.github.io/NumuneAnaliz/
// Dev'de kok ("/"), production build'de repo alt-yolu kullanilir.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/NumuneAnaliz/" : "/",
  plugins: [react(), tailwindcss()],
}));
