# 14. Vue3 鐨?provide 鍜?inject 濡備綍瀹炵幇鍝嶅簲寮忥紵

**绛旀锛?*

### 鍩烘湰鐢ㄦ硶

```javascript
// 绁栧厛缁勪欢
import { provide, ref } from 'vue';

export default {
  setup() {
    const theme = ref('light');

    // 鎻愪緵鍝嶅簲寮忔暟鎹?    provide('theme', theme);

    // 鎻愪緵鏂规硶
    provide('updateTheme', (newTheme) => {
      theme.value = newTheme;
    });
  }
};

// 鍚庝唬缁勪欢
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
# 15. Vue3 鐨?provide 鍜?inject 濡備綍浣跨敤 readonly锛?
**绛旀锛?*

```javascript
import { provide, ref, readonly } from 'vue';

export default {
  setup() {
    const state = ref({
      count: 0,
      name: 'John'
    });

    // 鎻愪緵鍙鏁版嵁
    provide('state', readonly(state));

    // 鎻愪緵淇敼鏂规硶
    provide('setState', (newState) => {
      state.value = { ...state.value, ...newState };
    });
  }
};
```

---
# 16. Vue3 鐨?provide 鍜?inject 濡備綍浣跨敤 Symbol锛?
**绛旀锛?*

```javascript
// keys.js
import { Symbol } from 'vue';

export const ThemeKey = Symbol('theme');
export const UpdateThemeKey = Symbol('updateTheme');

// 绁栧厛缁勪欢
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

// 鍚庝唬缁勪欢
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
# 17. Vue3 鐨?provide 鍜?inject 濡備綍鏀寔 TypeScript锛?
**绛旀锛?*

```typescript
// types.ts
interface ThemeContext {
  theme: Ref<string>;
  updateTheme: (theme: string) => void;
}

// 绁栧厛缁勪欢
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

// 鍚庝唬缁勪欢
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
