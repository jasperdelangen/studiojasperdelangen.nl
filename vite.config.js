import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    copyPublicDir: false,
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        over: resolve(__dirname, 'over/index.html'),
        panoptica: resolve(__dirname, 'panoptica/index.html'),
        proeftuin: resolve(__dirname, 'proeftuin/index.html'),
        experimenten: resolve(__dirname, 'experimenten/index.html'),
        schilderkunst: resolve(__dirname, 'schilderkunst/index.html'),
        nieuws: resolve(__dirname, 'nieuws/index.html')
      }
    }
  }
})
