# 26. qiankun 如何处理子应用的国际化？

**答案：**

### 1. 主应用统一管理

```javascript
// 主应用
const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
});

registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1',
    props: {
      i18n,
      t: i18n.global.t
    }
  }
]);

// 子应用
export async function mount(props) {
  const { t } = props;
  console.log(t('hello'));
}
```

### 2. 子应用独立管理

```javascript
// 子应用
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
});

// 通过 props 接收主应用的语言设置
export async function mount(props) {
  if (props.locale) {
    i18n.global.locale = props.locale;
  }
}
```

### 3. 全局状态同步

```javascript
// 主应用
const { setGlobalState } = initGlobalState({
  locale: 'zh-CN'
});

function changeLocale(locale) {
  setGlobalState({ locale });
}

// 子应用
export async function mount(props) {
  props.onGlobalStateChange((state) => {
    i18n.global.locale = state.locale;
  });
}
```

---