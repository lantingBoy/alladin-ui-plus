
### 特性
-💎 简单易用 - 基于 Element-plus 进行面向常见业务的封装
-📦 场景丰富 - 提供一些列面向常见业务场景基础组件
-💡 TypeScript - 提供完整 TypeScript 类型定义
-🎨 更少的代码 - 多种配置减少代码的书写

### 发布到githubio
- 提交代码后，登录到github 点Actions查看流水线是否构建成功
```js
// 需要在使用的项目的tsconfig.json文件中添加以下
compilerOptions：{
  "types": [
      "lighting-pro/global.d.ts",
    ],
}

```
## 安装依赖
> ### 注意: 本地环境版本最好安装 [Node.js 16.x+](https://nodejs.org/en)、[pnpm 7.x+](https://github.com/pnpm/pnpm/)

```shell
npm install -g pnpm

pnpm install

```


## 本地运行 vuepress 中组件文档

```shell
// docs项目(文档demo示例)基于vue3+vite项目
npm run docs:dev

```

