import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // IMPORTANTE

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: env.VITE_BASE_PATH || "/",
    plugins: [
      react(),
      tailwindcss(), // IMPORTANTE
    ],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
        "/centrolider/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
        "/uploads": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
        "/centrolider/uploads": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },
  };
});
