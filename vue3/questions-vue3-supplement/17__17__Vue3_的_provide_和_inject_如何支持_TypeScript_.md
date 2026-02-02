# 17. Vue3 的 provide 和 inject 如何支持 TypeScript？

**答案：**

```typescript
// types.ts
interface ThemeContext {
  theme: Ref<string>;
  updateTheme: (theme: string) => void;
}

// 祖先组件
import { provide, ref, type InjectionKey } from 'vue';

const themeKey: InjectionKey<ThemeContext> = Symbol('theme');

export default {
  setup() {
    const theme = ref('light');

    const updateTheme = (newTheme: string) => {
      theme.value = newTheme;
    };

    provide(themeKey, {
      theme,
      updateTheme
    });
  }
};

// 后代组件
import { inject } from 'vue';
import { themeKey } from './types';

export default {
  setup() {
    const { theme, updateTheme } = inject(themeKey)!;

    return { theme, updateTheme };
  }
};
```

---