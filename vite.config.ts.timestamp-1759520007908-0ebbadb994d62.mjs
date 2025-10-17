// vite.config.ts
import vue from "file:///home/rogers/Code/Wrioter%20Branch%202/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///home/rogers/Code/Wrioter%20Branch%202/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import laravel from "file:///home/rogers/Code/Wrioter%20Branch%202/node_modules/laravel-vite-plugin/dist/index.js";
import { fileURLToPath } from "node:url";
import AutoImport from "file:///home/rogers/Code/Wrioter%20Branch%202/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///home/rogers/Code/Wrioter%20Branch%202/node_modules/unplugin-vue-components/dist/vite.js";
import { VueRouterAutoImports, getPascalCaseRouteName } from "file:///home/rogers/Code/Wrioter%20Branch%202/node_modules/unplugin-vue-router/dist/index.mjs";
import VueRouter from "file:///home/rogers/Code/Wrioter%20Branch%202/node_modules/unplugin-vue-router/dist/vite.mjs";
import { defineConfig } from "file:///home/rogers/Code/Wrioter%20Branch%202/node_modules/vite/dist/node/index.js";
import Layouts from "file:///home/rogers/Code/Wrioter%20Branch%202/node_modules/vite-plugin-vue-layouts/dist/index.mjs";
import vuetify from "file:///home/rogers/Code/Wrioter%20Branch%202/node_modules/vite-plugin-vuetify/dist/index.mjs";
import svgLoader from "file:///home/rogers/Code/Wrioter%20Branch%202/node_modules/vite-svg-loader/index.js";
var __vite_injected_original_import_meta_url = "file:///home/rogers/Code/Wrioter%20Branch%202/vite.config.ts";
var vite_config_default = defineConfig({
  base: "/build/",
  // Ensure correct base path for history mode
  plugins: [
    // Vue Router plugin should be placed before Vue plugin
    VueRouter({
      getRouteName: (routeNode) => {
        return getPascalCaseRouteName(routeNode).replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();
      },
      routesFolder: "resources/ts/pages"
    }),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === "swiper-container" || tag === "swiper-slide"
        },
        transformAssetUrls: {
          base: null,
          includeAbsolute: false
        }
      }
    }),
    laravel({
      input: ["resources/ts/main.ts"],
      refresh: true,
      buildDirectory: "public/build"
      // Ensure Laravel serves the correct build
    }),
    vueJsx(),
    vuetify({
      styles: {
        configFile: "resources/styles/variables/_vuetify.scss"
      }
    }),
    Layouts({
      layoutsDirs: "./resources/ts/layouts/"
    }),
    Components({
      dirs: ["resources/ts/@core/components", "resources/ts/views/demos", "resources/ts/components"],
      dts: true,
      resolvers: [
        (componentName) => {
          if (componentName === "VueApexCharts")
            return { name: "default", from: "vue3-apexcharts", as: "VueApexCharts" };
        }
      ]
    }),
    AutoImport({
      imports: ["vue", VueRouterAutoImports, "@vueuse/core", "@vueuse/math", "vue-i18n", "pinia"],
      dirs: [
        "./resources/ts/@core/utils",
        "./resources/ts/@core/composable/",
        "./resources/ts/composables/",
        "./resources/ts/utils/",
        "./resources/ts/plugins/*/composables/*"
      ],
      vueTemplate: true,
      ignore: ["useCookies", "useStorage"]
    }),
    svgLoader()
  ],
  define: {
    "process.env": {
      VITE_API_URL: process.env.VITE_API_URL,
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      VITE_APP_ENV: process.env.NODE_ENV
    }
  },
  resolve: {
    alias: {
      "@core-scss": fileURLToPath(new URL("./resources/styles/@core", __vite_injected_original_import_meta_url)),
      "@": fileURLToPath(new URL("./resources/ts", __vite_injected_original_import_meta_url)),
      "@themeConfig": fileURLToPath(new URL("./themeConfig.ts", __vite_injected_original_import_meta_url)),
      "@core": fileURLToPath(new URL("./resources/ts/@core", __vite_injected_original_import_meta_url)),
      "@layouts": fileURLToPath(new URL("./resources/ts/@layouts", __vite_injected_original_import_meta_url)),
      "@images": fileURLToPath(new URL("./resources/images/", __vite_injected_original_import_meta_url)),
      "@styles": fileURLToPath(new URL("./resources/styles/", __vite_injected_original_import_meta_url)),
      "@configured-variables": fileURLToPath(new URL("./resources/styles/variables/_template.scss", __vite_injected_original_import_meta_url)),
      "@db": fileURLToPath(new URL("./resources/ts/plugins/fake-api/handlers/", __vite_injected_original_import_meta_url)),
      "@api-utils": fileURLToPath(new URL("./resources/ts/plugins/fake-api/utils/", __vite_injected_original_import_meta_url))
    }
  },
  build: {
    outDir: "public/build",
    emptyOutDir: true,
    manifest: "manifest.json",
    rollupOptions: {
      input: "resources/ts/main.ts",
      output: {
        manualChunks: void 0,
        entryFileNames: "js/[name].[hash].js",
        chunkFileNames: "js/[name].[hash].js",
        assetFileNames: "assets/[name].[hash][extname]"
      }
    },
    sourcemap: false,
    // Disable sourcemaps in production
    minify: "terser",
    target: "esnext"
  },
  optimizeDeps: {
    exclude: ["vuetify"],
    entries: ["./resources/ts/**/*.vue"]
  },
  server: {
    hmr: {
      host: "localhost"
    },
    port: process.env.NODE_ENV === "testing" ? 5174 : 5173
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9yb2dlcnMvQ29kZS9XcmlvdGVyIEJyYW5jaCAyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9yb2dlcnMvQ29kZS9XcmlvdGVyIEJyYW5jaCAyL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3JvZ2Vycy9Db2RlL1dyaW90ZXIlMjBCcmFuY2glMjAyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgdnVlSnN4IGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZS1qc3gnXG5pbXBvcnQgbGFyYXZlbCBmcm9tICdsYXJhdmVsLXZpdGUtcGx1Z2luJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJ1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnXG5pbXBvcnQgeyBWdWVSb3V0ZXJBdXRvSW1wb3J0cywgZ2V0UGFzY2FsQ2FzZVJvdXRlTmFtZSB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1yb3V0ZXInXG5pbXBvcnQgVnVlUm91dGVyIGZyb20gJ3VucGx1Z2luLXZ1ZS1yb3V0ZXIvdml0ZSdcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgTGF5b3V0cyBmcm9tICd2aXRlLXBsdWdpbi12dWUtbGF5b3V0cydcbmltcG9ydCB2dWV0aWZ5IGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZXRpZnknXG5pbXBvcnQgc3ZnTG9hZGVyIGZyb20gJ3ZpdGUtc3ZnLWxvYWRlcidcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJhc2U6ICcvYnVpbGQvJywgLy8gRW5zdXJlIGNvcnJlY3QgYmFzZSBwYXRoIGZvciBoaXN0b3J5IG1vZGVcblxuICBwbHVnaW5zOiBbXG4gICAgLy8gVnVlIFJvdXRlciBwbHVnaW4gc2hvdWxkIGJlIHBsYWNlZCBiZWZvcmUgVnVlIHBsdWdpblxuICAgIFZ1ZVJvdXRlcih7XG4gICAgICBnZXRSb3V0ZU5hbWU6IHJvdXRlTm9kZSA9PiB7XG4gICAgICAgIHJldHVybiBnZXRQYXNjYWxDYXNlUm91dGVOYW1lKHJvdXRlTm9kZSlcbiAgICAgICAgICAucmVwbGFjZSgvKFthLXpcXGRdKShbQS1aXSkvZywgJyQxLSQyJylcbiAgICAgICAgICAudG9Mb3dlckNhc2UoKVxuICAgICAgfSxcbiAgICAgIHJvdXRlc0ZvbGRlcjogJ3Jlc291cmNlcy90cy9wYWdlcycsXG4gICAgfSksXG4gICAgdnVlKHtcbiAgICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIGNvbXBpbGVyT3B0aW9uczoge1xuICAgICAgICAgIGlzQ3VzdG9tRWxlbWVudDogdGFnID0+IHRhZyA9PT0gJ3N3aXBlci1jb250YWluZXInIHx8IHRhZyA9PT0gJ3N3aXBlci1zbGlkZScsXG4gICAgICAgIH0sXG4gICAgICAgIHRyYW5zZm9ybUFzc2V0VXJsczoge1xuICAgICAgICAgIGJhc2U6IG51bGwsXG4gICAgICAgICAgaW5jbHVkZUFic29sdXRlOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgbGFyYXZlbCh7XG4gICAgICBpbnB1dDogWydyZXNvdXJjZXMvdHMvbWFpbi50cyddLFxuICAgICAgcmVmcmVzaDogdHJ1ZSxcbiAgICAgIGJ1aWxkRGlyZWN0b3J5OiAncHVibGljL2J1aWxkJywgLy8gRW5zdXJlIExhcmF2ZWwgc2VydmVzIHRoZSBjb3JyZWN0IGJ1aWxkXG4gICAgfSksXG4gICAgdnVlSnN4KCksXG4gICAgdnVldGlmeSh7XG4gICAgICBzdHlsZXM6IHtcbiAgICAgICAgY29uZmlnRmlsZTogJ3Jlc291cmNlcy9zdHlsZXMvdmFyaWFibGVzL192dWV0aWZ5LnNjc3MnLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBMYXlvdXRzKHtcbiAgICAgIGxheW91dHNEaXJzOiAnLi9yZXNvdXJjZXMvdHMvbGF5b3V0cy8nLFxuICAgIH0pLFxuICAgIENvbXBvbmVudHMoe1xuICAgICAgZGlyczogWydyZXNvdXJjZXMvdHMvQGNvcmUvY29tcG9uZW50cycsICdyZXNvdXJjZXMvdHMvdmlld3MvZGVtb3MnLCAncmVzb3VyY2VzL3RzL2NvbXBvbmVudHMnXSxcbiAgICAgIGR0czogdHJ1ZSxcbiAgICAgIHJlc29sdmVyczogW1xuICAgICAgICBjb21wb25lbnROYW1lID0+IHtcbiAgICAgICAgICBpZiAoY29tcG9uZW50TmFtZSA9PT0gJ1Z1ZUFwZXhDaGFydHMnKVxuICAgICAgICAgICAgcmV0dXJuIHsgbmFtZTogJ2RlZmF1bHQnLCBmcm9tOiAndnVlMy1hcGV4Y2hhcnRzJywgYXM6ICdWdWVBcGV4Q2hhcnRzJyB9XG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pLFxuICAgIEF1dG9JbXBvcnQoe1xuICAgICAgaW1wb3J0czogWyd2dWUnLCBWdWVSb3V0ZXJBdXRvSW1wb3J0cywgJ0B2dWV1c2UvY29yZScsICdAdnVldXNlL21hdGgnLCAndnVlLWkxOG4nLCAncGluaWEnXSxcbiAgICAgIGRpcnM6IFtcbiAgICAgICAgJy4vcmVzb3VyY2VzL3RzL0Bjb3JlL3V0aWxzJyxcbiAgICAgICAgJy4vcmVzb3VyY2VzL3RzL0Bjb3JlL2NvbXBvc2FibGUvJyxcbiAgICAgICAgJy4vcmVzb3VyY2VzL3RzL2NvbXBvc2FibGVzLycsXG4gICAgICAgICcuL3Jlc291cmNlcy90cy91dGlscy8nLFxuICAgICAgICAnLi9yZXNvdXJjZXMvdHMvcGx1Z2lucy8qL2NvbXBvc2FibGVzLyonLFxuICAgICAgXSxcbiAgICAgIHZ1ZVRlbXBsYXRlOiB0cnVlLFxuICAgICAgaWdub3JlOiBbJ3VzZUNvb2tpZXMnLCAndXNlU3RvcmFnZSddLFxuICAgIH0pLFxuICAgIHN2Z0xvYWRlcigpLFxuICBdLFxuXG4gIGRlZmluZToge1xuICAgICdwcm9jZXNzLmVudic6IHtcbiAgICAgIFZJVEVfQVBJX1VSTDogcHJvY2Vzcy5lbnYuVklURV9BUElfVVJMLFxuICAgICAgVklURV9BUElfQkFTRV9VUkw6IHByb2Nlc3MuZW52LlZJVEVfQVBJX0JBU0VfVVJMLFxuICAgICAgTk9ERV9FTlY6IHByb2Nlc3MuZW52Lk5PREVfRU5WLFxuICAgICAgVklURV9BUFBfRU5WOiBwcm9jZXNzLmVudi5OT0RFX0VOVixcbiAgICB9LFxuICB9LFxuXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0Bjb3JlLXNjc3MnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vcmVzb3VyY2VzL3N0eWxlcy9AY29yZScsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vcmVzb3VyY2VzL3RzJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAnQHRoZW1lQ29uZmlnJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3RoZW1lQ29uZmlnLnRzJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAnQGNvcmUnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vcmVzb3VyY2VzL3RzL0Bjb3JlJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAnQGxheW91dHMnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vcmVzb3VyY2VzL3RzL0BsYXlvdXRzJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAnQGltYWdlcyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9yZXNvdXJjZXMvaW1hZ2VzLycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgJ0BzdHlsZXMnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vcmVzb3VyY2VzL3N0eWxlcy8nLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICdAY29uZmlndXJlZC12YXJpYWJsZXMnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vcmVzb3VyY2VzL3N0eWxlcy92YXJpYWJsZXMvX3RlbXBsYXRlLnNjc3MnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICdAZGInOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vcmVzb3VyY2VzL3RzL3BsdWdpbnMvZmFrZS1hcGkvaGFuZGxlcnMvJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAnQGFwaS11dGlscyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9yZXNvdXJjZXMvdHMvcGx1Z2lucy9mYWtlLWFwaS91dGlscy8nLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICB9LFxuICB9LFxuXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAncHVibGljL2J1aWxkJyxcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgICBtYW5pZmVzdDogJ21hbmlmZXN0Lmpzb24nLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGlucHV0OiAncmVzb3VyY2VzL3RzL21haW4udHMnLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczogdW5kZWZpbmVkLFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2pzL1tuYW1lXS5baGFzaF0uanMnLFxuICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2pzL1tuYW1lXS5baGFzaF0uanMnLFxuICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0uW2hhc2hdW2V4dG5hbWVdJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBzb3VyY2VtYXA6IGZhbHNlLCAvLyBEaXNhYmxlIHNvdXJjZW1hcHMgaW4gcHJvZHVjdGlvblxuICAgIG1pbmlmeTogJ3RlcnNlcicsXG4gICAgdGFyZ2V0OiAnZXNuZXh0JyxcbiAgfSxcblxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ3Z1ZXRpZnknXSxcbiAgICBlbnRyaWVzOiBbJy4vcmVzb3VyY2VzL3RzLyoqLyoudnVlJ10sXG4gIH0sXG5cbiAgc2VydmVyOiB7XG4gICAgaG1yOiB7XG4gICAgICBob3N0OiAnbG9jYWxob3N0JyxcbiAgICB9LFxuICAgIHBvcnQ6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAndGVzdGluZycgPyA1MTc0IDogNTE3MyxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE0UixPQUFPLFNBQVM7QUFDNVMsT0FBTyxZQUFZO0FBQ25CLE9BQU8sYUFBYTtBQUNwQixTQUFTLHFCQUFxQjtBQUM5QixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGdCQUFnQjtBQUN2QixTQUFTLHNCQUFzQiw4QkFBOEI7QUFDN0QsT0FBTyxlQUFlO0FBQ3RCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sYUFBYTtBQUNwQixPQUFPLGFBQWE7QUFDcEIsT0FBTyxlQUFlO0FBWHNKLElBQU0sMkNBQTJDO0FBYzdOLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQTtBQUFBLEVBRU4sU0FBUztBQUFBO0FBQUEsSUFFUCxVQUFVO0FBQUEsTUFDUixjQUFjLGVBQWE7QUFDekIsZUFBTyx1QkFBdUIsU0FBUyxFQUNwQyxRQUFRLHFCQUFxQixPQUFPLEVBQ3BDLFlBQVk7QUFBQSxNQUNqQjtBQUFBLE1BQ0EsY0FBYztBQUFBLElBQ2hCLENBQUM7QUFBQSxJQUNELElBQUk7QUFBQSxNQUNGLFVBQVU7QUFBQSxRQUNSLGlCQUFpQjtBQUFBLFVBQ2YsaUJBQWlCLFNBQU8sUUFBUSxzQkFBc0IsUUFBUTtBQUFBLFFBQ2hFO0FBQUEsUUFDQSxvQkFBb0I7QUFBQSxVQUNsQixNQUFNO0FBQUEsVUFDTixpQkFBaUI7QUFBQSxRQUNuQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELFFBQVE7QUFBQSxNQUNOLE9BQU8sQ0FBQyxzQkFBc0I7QUFBQSxNQUM5QixTQUFTO0FBQUEsTUFDVCxnQkFBZ0I7QUFBQTtBQUFBLElBQ2xCLENBQUM7QUFBQSxJQUNELE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxNQUNOLFFBQVE7QUFBQSxRQUNOLFlBQVk7QUFBQSxNQUNkO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxRQUFRO0FBQUEsTUFDTixhQUFhO0FBQUEsSUFDZixDQUFDO0FBQUEsSUFDRCxXQUFXO0FBQUEsTUFDVCxNQUFNLENBQUMsaUNBQWlDLDRCQUE0Qix5QkFBeUI7QUFBQSxNQUM3RixLQUFLO0FBQUEsTUFDTCxXQUFXO0FBQUEsUUFDVCxtQkFBaUI7QUFDZixjQUFJLGtCQUFrQjtBQUNwQixtQkFBTyxFQUFFLE1BQU0sV0FBVyxNQUFNLG1CQUFtQixJQUFJLGdCQUFnQjtBQUFBLFFBQzNFO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsV0FBVztBQUFBLE1BQ1QsU0FBUyxDQUFDLE9BQU8sc0JBQXNCLGdCQUFnQixnQkFBZ0IsWUFBWSxPQUFPO0FBQUEsTUFDMUYsTUFBTTtBQUFBLFFBQ0o7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsYUFBYTtBQUFBLE1BQ2IsUUFBUSxDQUFDLGNBQWMsWUFBWTtBQUFBLElBQ3JDLENBQUM7QUFBQSxJQUNELFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFFQSxRQUFRO0FBQUEsSUFDTixlQUFlO0FBQUEsTUFDYixjQUFjLFFBQVEsSUFBSTtBQUFBLE1BQzFCLG1CQUFtQixRQUFRLElBQUk7QUFBQSxNQUMvQixVQUFVLFFBQVEsSUFBSTtBQUFBLE1BQ3RCLGNBQWMsUUFBUSxJQUFJO0FBQUEsSUFDNUI7QUFBQSxFQUNGO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxjQUFjLGNBQWMsSUFBSSxJQUFJLDRCQUE0Qix3Q0FBZSxDQUFDO0FBQUEsTUFDaEYsS0FBSyxjQUFjLElBQUksSUFBSSxrQkFBa0Isd0NBQWUsQ0FBQztBQUFBLE1BQzdELGdCQUFnQixjQUFjLElBQUksSUFBSSxvQkFBb0Isd0NBQWUsQ0FBQztBQUFBLE1BQzFFLFNBQVMsY0FBYyxJQUFJLElBQUksd0JBQXdCLHdDQUFlLENBQUM7QUFBQSxNQUN2RSxZQUFZLGNBQWMsSUFBSSxJQUFJLDJCQUEyQix3Q0FBZSxDQUFDO0FBQUEsTUFDN0UsV0FBVyxjQUFjLElBQUksSUFBSSx1QkFBdUIsd0NBQWUsQ0FBQztBQUFBLE1BQ3hFLFdBQVcsY0FBYyxJQUFJLElBQUksdUJBQXVCLHdDQUFlLENBQUM7QUFBQSxNQUN4RSx5QkFBeUIsY0FBYyxJQUFJLElBQUksK0NBQStDLHdDQUFlLENBQUM7QUFBQSxNQUM5RyxPQUFPLGNBQWMsSUFBSSxJQUFJLDZDQUE2Qyx3Q0FBZSxDQUFDO0FBQUEsTUFDMUYsY0FBYyxjQUFjLElBQUksSUFBSSwwQ0FBMEMsd0NBQWUsQ0FBQztBQUFBLElBQ2hHO0FBQUEsRUFDRjtBQUFBLEVBRUEsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2IsVUFBVTtBQUFBLElBQ1YsZUFBZTtBQUFBLE1BQ2IsT0FBTztBQUFBLE1BQ1AsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFFBQ2QsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUE7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxFQUNWO0FBQUEsRUFFQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsU0FBUztBQUFBLElBQ25CLFNBQVMsQ0FBQyx5QkFBeUI7QUFBQSxFQUNyQztBQUFBLEVBRUEsUUFBUTtBQUFBLElBQ04sS0FBSztBQUFBLE1BQ0gsTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBLE1BQU0sUUFBUSxJQUFJLGFBQWEsWUFBWSxPQUFPO0FBQUEsRUFDcEQ7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
