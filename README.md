# activity-pages

大象集团活动页面

## 已上线项目列表

- 隐私协议
  - charity： 慈善协议
  - blockchain： 金诚慈善区块链
  - nettv： TV 用户协议
- bookworm： 图书馆书虫
- pet： 宠物俱乐部
- retail： 无人货架
- ~~question：仿佛图书馆~~

## 目录结构

```js
├── static              # 全局通用的某些第三方库 可用<script>引入 详情见下文
└── src
     ├── assets         # 存放公用的图片
     ├── privacy        # 存放隐私协议页面，不会打包
     ├── utils          # 工具库 在项目 main.js 中用 import 引入
     ├── ...            # 其他项目文件
```

## 项目结构

### 原生 js

```js
.
├── css                      # css 文件
├── images                   # 图像目录
├── js                       # 其他js文件可从这里import
├── main.js                  # js 主入口
└── index.html               # 开发用 html 文件，打包时会生成 index.html 文件
```

### vue

```js
.
├── main.js                  # js 主入口
└── index.html               # 开发用 html 文件，打包时会生成 index.html 文件
```

## px => rem

[postcss-plugin-px2rem](https://github.com/ant-tool/postcss-plugin-px2rem)

配置信息在 `.postcssrc.js` 文件中，默认会将除 `font-size` 和 `border` 之外的所有 px 转成 rem，若是极个别指定的无需转换，可用单位 `PX`

## skeleton

需要先安装 `page-skeleton-webpack-plugin`，注意不能加到 package.json 中，否则构建会失败。

[page-skeleton-webpack-plugin](https://github.com/ElemeFE/page-skeleton-webpack-plugin/blob/master/docs/i18n/zh_cn.md)

当前仅支持在 develop 环境生成 skeleton 代码，然后将 `shell/index.html` 中的代码拷贝到相应地方即可

## LIB & CDN

config.index 中由 externals 配置

使用方法:

1. 在 `config/index.js` 中配置 externals

```js
  externals: {
    // ...other externals
    axios: 'axios',
  },
```

2. 在项目 index.html 中添加

```html
<script src="./static/lib/axios.min.js"></script>

// or

<script src="//cdn.bootcss.com/axios/0.18.0/axios.min.js"></script>
```

3. 在 main.js 中 import ( 为了防止全局变量污染 )

```js
import axios from 'axios'
```

当前支持列表:

- axios

### 其他

微信、魔窗的地址

```html
<script src="https://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
<script src="https://static.mlinks.cc/scripts/dist/mlink.min.js"></script>
```

## Alias

@: src/utils

## 开发

修改 config 里的 fileName

```shell
yarn dev || yarn start    // 开发单个页面
```

## 构建

```shell
yarn build             // 生产环境打包
```

## TODO

- ~~script/CDN 方式引入公共资源 ?webpack copyPlugin~~
- ~~提取公共组件至lib~~
- ~~添加项目通用lib~~
- ~~重构share等方法~~
- 下载按钮用魔窗配置
- 测试font打包
- vue使用cdn打包


