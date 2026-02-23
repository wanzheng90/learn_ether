import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  // 把项目根目录设为 frontend/，否则 Vite 会在仓库根目录找 index.html，导致 404
  root: fileURLToPath(new URL(".", import.meta.url)),

  plugins: [react()],

  server: {
    // 绑定到本机地址。初学阶段使用 localhost 最直观
    host: "127.0.0.1",
    port: 5173,
  },
});
