# 14. Vue3 的 provide 和 inject 如何实现响应式？

**答案：**

### 基本用法

```javascript
// 祖先组件
import { provide, ref } from 'vue';

export default {
  setup() {
    const theme = ref('light');

    // 提供响应式数据
    provide('theme', theme);

    // 提供方法
    provide('updateTheme', (newTheme) => {
      theme.value = newTheme;
    });
  }
};

// 后代组件
import { inject } from 'vue';

export default {
  setup() {
    const theme = inject('theme');
    const updateTheme = inject('updateTheme');

    return { theme, updateTheme };
  }
};
```

---