import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "ونسنّا",
        short_name: "ونسنّا",
        description: "ألعاب تجمعكم على جوال واحد",
        theme_color: "#6C4CF1",
        background_color: "#F7F5FF",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",

        icons: [
          {
            src: "/Wansna_icon_192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/Wansna_icon_512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/Wansna_icon_512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});