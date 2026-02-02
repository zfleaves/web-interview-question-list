# 16. Vue3 的 provide 和 inject 如何使用 Symbol？

**答案：**

```javascript
// keys.js
import { Symbol } from 'vue';

export const ThemeKey = Symbol('theme');
export const UpdateThemeKey = Symbol('updateTheme');

// 祖先组件
import { provide, ref } from 'vue';
import { ThemeKey, UpdateThemeKey } from './keys';

export default {
  setup() {
    const theme = ref('light');

    provide(ThemeKey, theme);
    provide(UpdateThemeKey, (newTheme) => {
      theme.value = newTheme;
    });
  }
};

// 后代组件
import { inject } from 'vue';
import { ThemeKey, UpdateThemeKey } from './keys';

export default {
  setup() {
    const theme = inject(ThemeKey);
    const updateTheme = inject(UpdateThemeKey);

    return { theme, updateTheme };
  }
};
```

---