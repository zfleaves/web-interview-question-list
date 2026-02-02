# 6. Vue3 的 Suspense 组件有哪些注意事项？

**答案：**

1. **Suspense 只能在 setup 函数或 `<script setup>` 中使用**
2. **异步组件必须返回一个 Promise**
3. **Suspense 会等待所有异步依赖加载完成**

---