# 依赖可视化

## 使用

```javascript
//webpack.config.js
const depPlugin = require('./plugin/dep-plugin/index.js');

plugins: [
  new depPlugin('./src/main.js')
]
```

访问 localhost:8081  

![效果图](https://chenweilin.xin/blogImg/1557046241039vRdep.PNG)