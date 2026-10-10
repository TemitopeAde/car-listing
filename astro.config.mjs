// @ts-check
import { defineConfig } from "astro/config";
import wix from "@wix/astro";
import react from "@astrojs/react";
import wixHostingAdapter from "@wix/astro-wix-hosting-adapter";

const localPreview = process.env.CAR_LISTING_DEMO === "1";
const building = process.argv.includes("build");

export default defineConfig({
  output: "server",
  adapter: localPreview ? undefined : wixHostingAdapter(),
  integrations: localPreview ? [react()] : [wix(), react()],
  image: {
    domains: ["static.wixstatic.com"],
    service: { entrypoint: "astro/assets/services/noop" },
  },
  security: { checkOrigin: false },
  devToolbar: { enabled: false },
  vite: {
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    // Keep concurrent demo, Wix development, and build optimizers from replacing
    // each other's dependency metadata while dashboard modules are loading.
    cacheDir: `node_modules/.vite/car-listing-${localPreview ? "demo" : "wix"}-${building ? "build" : "dev"}`,
    define: {
      "import.meta.env.PUBLIC_CAR_LISTING_DEMO": JSON.stringify(
        localPreview ? "1" : "0",
      ),
    },
    server: {
      cors: true,
    },
  },
});
