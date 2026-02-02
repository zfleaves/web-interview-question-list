# 17. 如何使用 ESLint 进行代码质量监控？

**答案：**

```javascript
// .eslintrc.cjs
module.exports = {
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
};
```

---