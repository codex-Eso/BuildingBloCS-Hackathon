import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    // Handle client-side routing - redirect all requests to index.html
    historyApiFallback: true,
  },
  preview: {
    // Same for preview mode
    historyApiFallback: true,
  },
});
