import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isVercel = process.env.VERCEL === "1";
const rawPort  = process.env.PORT ?? "3000";
const basePath = process.env.BASE_PATH ?? "/";
const port     = Number(rawPort);

const devPlugins =
  process.env.NODE_ENV !== "production" && process.env.REPL_ID
    ? await Promise.all([
        import("@replit/vite-plugin-cartographer").then((m) =>
          m.cartographer({ root: path.resolve(import.meta.dirname, "..") }),
        ),
        import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
        import("@replit/vite-plugin-runtime-error-modal").then((m) =>
          (m.runtimeErrorOverlay ?? m.default)(),
        ),
      ])
    : [];

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss(), ...devPlugins],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: isVercel ? 3000 : port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: { strict: true },
  },
  preview: {
    port: isVercel ? 3000 : port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
