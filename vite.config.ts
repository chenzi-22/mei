import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // 相对路径：GitHub Pages 的项目站挂在 /<仓库名>/ 下。
  // 用 './' 之后，根域名部署和子目录部署都能直接跑，不必把仓库名写死在这里。
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 5273,
    strictPort: true,
  },
})
