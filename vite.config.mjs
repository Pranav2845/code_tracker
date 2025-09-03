// File: vite.config.mjs
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

export default defineConfig({
  build: {
    outDir: "dist",            // ⬅️ change from "build" to "dist"
    chunkSizeWarningLimit: 2000,
    sourcemap: true,           // optional but handy on Vercel
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4028", // dev only; not used on Vercel
    },
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: [".amazonaws.com", ".builtwithrocket.new"],
  },
  plugins: [tsconfigPaths(), react(), tagger()],
});
