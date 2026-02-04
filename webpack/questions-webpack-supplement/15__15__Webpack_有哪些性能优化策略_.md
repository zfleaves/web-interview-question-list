# 15. Webpack 有哪些性能优化策略？

**答案：**

Webpack 性能优化策略包括：

1. **构建速度优化**：
   - 开启持久化缓存
   - 使用多线程
   - 减少构建范围（exclude/include）
   - 使用 DLL 预编译

2. **打包体积优化**：
   - 代码分割
   - Tree Shaking
   - 压缩代码
   - 使用 externals 和 CDN

3. **加载性能优化**：
   - 懒加载
   - 预加载/预取
   - 资源压缩
   - 开启 Gzip/Brotli

4. **开发体验优化**：
   - 热更新
   - Source Map
   - 构建分析（webpack-bundle-analyzer）