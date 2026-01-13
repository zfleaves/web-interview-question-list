import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'react',
          dest: ''
        },
        {
          src: 'vue2',
          dest: ''
        },
        {
          src: 'vue3',
          dest: ''
        },
        {
          src: 'javascript',
          dest: ''
        },
        {
          src: 'css',
          dest: ''
        },
        {
          src: 'html',
          dest: ''
        },
        {
          src: 'typescript',
          dest: ''
        },
        {
          src: 'es6',
          dest: ''
        },
        {
          src: 'http',
          dest: ''
        },
        {
          src: 'webpack',
          dest: ''
        },
        {
          src: 'vite',
          dest: ''
        },
        {
          src: 'git',
          dest: ''
        },
        {
          src: 'node',
          dest: ''
        },
        {
          src: 'design-patterns',
          dest: ''
        },
        {
          src: 'miniprogram',
          dest: ''
        },
        {
          src: 'scenarios',
          dest: ''
        },
        {
          src: 'algorithm',
          dest: ''
        }
      ]
    })
  ]
});