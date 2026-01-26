/*
 * @Date: 2026-01-26 18:39:55
 * @LastEditors: zhangming 1051403128@qq.com
 * @LastEditTime: 2026-01-26 18:42:33
 * @FilePath: \web-interview-question-list\vite.config.js
 */
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  server: {
    host: '0.0.0.0',
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