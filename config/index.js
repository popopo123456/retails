'use strict'

const path = require('path')

module.exports = {
  fileName: 'retail',
  // 额外没有main.js的文件打包
  additionalFiles: ['privacy', 'assets', 'bookworm'],
  // 不需要打包的项目 即不会出现在dist当中
  exceptFiles: ['bak'],
  // 第三方包
  externals: {
    axios: 'axios',
    wx: 'wx',
    Mlink: 'Window.Mlink',
    Swiper: 'Swiper'
  },
  start: {
    host: '10.100.122.133',
    port: 8080
  }
}
