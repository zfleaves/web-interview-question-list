# Vue3 的 provide 和 inject 高级用法

**答案：**

## 实现响应式

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

## 使用 readonly

```javascript
import { provide, ref, readonly } from 'vue';

export default {
  setup() {
    const state = ref({
      count: 0,
      name: 'John'
    });

    // 提供只读数据
    provide('state', readonly(state));

    // 提供修改方法
    provide('setState', (newState) => {
      state.value = { ...state.value, ...newState };
    });
  }
};
```

## 使用 Symbol

```javascript
// keys.js
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

## 支持 TypeScript

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