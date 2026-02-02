# 35. Webpack 如何使用响应式图片？

**答案：**

```javascript
import src from './image.png?sizes[]=300,sizes[]=600,sizes[]=1200';

function Image() {
  return (
    <img
      srcSet={`${src.srcSet}`}
      src={src.src}
      alt="Responsive Image"
    />
  );
}
```

---