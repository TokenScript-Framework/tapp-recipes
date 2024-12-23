import path from "path"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
export default defineConfig({
    plugins: [
        react(),
        viteSingleFile({
            removeViteModuleLoader: true,
            useRecommendedBuildConfig: true,
        }),
    ],
    resolve: {
        alias: {
          "@": path.resolve("./src"),
        },
      },
    build: {
        target: "esnext",
        minify: "esbuild",
        cssCodeSplit: false,
    },
});
//# sourceMappingURL=vite.config.js.map