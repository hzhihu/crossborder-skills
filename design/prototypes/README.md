# 静态视觉原型

> 历史资料说明：本原型及 A/B 切换仅用于历史设计研究，方向 B 和 A/B 切换不作为当前设计或实现依据，也不表示产品提供主题切换功能。当前唯一视觉方向为纯 A；原型代码、参数和样式不得直接复制到生产实现，原型及截图均不属于批准设计成果。

无需安装依赖，不代表 Next.js 正式工程。

## 运行

在仓库根目录执行：

```bash
python3 -m http.server 4173 --directory design/prototypes
```

打开 <http://localhost:4173/?theme=a&page=home>，页面右上角可切换 A/B 方向。

## 自检

```bash
node design/prototypes/self-check.js
```

所有资源、专题、日期与数量均为 Mock；无数据库、采集、登录、收藏、评论、投稿或一键复制功能。
