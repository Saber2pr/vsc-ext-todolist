# react-ts

react-ts

```bash
yarn
yarn dev
yarn build

# http://localhost:8081/
```

## 特性

### babel

1. @babel/core: babel 编译器核心 api
2. @babel/preset-env: 各个版本 javaScript 的编译语法解析（es6、7、8 到 es5）
3. @babel/preset-react: 编译 jsx 语法
4. @babel/preset-typescript: 编译 ts 语法
5. babel-loader: 所有代码文件通过 babel-loader 交给 babel 去处理
6. babel-plugin-import: antd 项目按需加载

> 如果是 react-native 项目，需要处理 flow 语法，安装@babel/preset-flow
