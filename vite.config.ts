import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { resolve } from "path";
import makeManifest from "./utils/plugins/make-manifest";
import customDynamicImport from './utils/plugins/custom-dynamic-import';
import vitePluginImp from 'vite-plugin-imp'

const root = resolve(__dirname, "src");
const pagesDir = resolve(root, "pages");
const assetsDir = resolve(root, "assets");
const publicDir = resolve(__dirname, "public");
const outDir = resolve(__dirname, "dist");

const isDev = process.env.__DEV__ === "true";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@src": root,
      "@assets": assetsDir,
      "@pages": pagesDir,
    },
  },
  plugins: [
    react(), 
    makeManifest(), 
    customDynamicImport(),
    // 按需加载配置
    vitePluginImp({
      libList: [
        {
          libName: "antd",
          style: (name) => `antd/es/${name}/style`,
        },
      ],
    }),
  ],
  publicDir,
  build: {
    outDir,
    sourcemap: isDev,
    rollupOptions: {
      input: {
        popup: resolve(pagesDir, "popup", "index.html"),
        options: resolve(pagesDir, "options", "index.html"),
        
        background: resolve(pagesDir, "background", "index.ts"),

        // content 需要在 manifest 中指定 css 资源
        content: resolve(pagesDir, "content", "index.ts"),
        contentStyle: resolve(pagesDir, "content", "style.less"),
      },
      output: {
        entryFileNames: "src/pages/[name]/index.js",
        chunkFileNames: isDev
          ? "assets/js/[name].js"
          : "assets/js/[name].[hash].js",
        assetFileNames: (assetInfo: {
          name: string | undefined;
          source: string | Uint8Array;
          type: 'asset';
        }) => {
          const { dir, name: _name } = path.parse(assetInfo.name || '');
          const assetFolder = getLastElement(dir.split("/"));
          const name = assetFolder + firstUpperCase(_name);
          return `assets/[ext]/${name}.chunk.[ext]`;
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          '@primary-color': '#1e80ff',//设置 antd 主题色
        },
      },
    }
  },
});

function getLastElement<T>(array: ArrayLike<T>): T {
  const length = array.length;
  const lastIndex = length - 1;
  return array[lastIndex];
}

function firstUpperCase(str: string) {
  const firstAlphabet = new RegExp(/( |^)[a-z]/, "g");
  return str.toLowerCase().replace(firstAlphabet, (L) => L.toUpperCase());
}
