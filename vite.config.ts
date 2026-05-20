import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite"; // 👈 We added this!

export default defineConfig({
  plugins: [
    tailwindcss(), // 👈 And this!
    TanStackRouterVite(),
    react(),
    tsconfigPaths(),
  ],
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
});