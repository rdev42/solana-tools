import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { VitePluginRadar } from "vite-plugin-radar";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      tailwindcss(),
      nodePolyfills(),
      VitePluginRadar({
        // Google Analytics tag injection
        analytics: {
          id: env.VITE_GA_ID ?? undefined,
        },
      }),
    ],
    // build: { sourcemap: true },
  };
});
