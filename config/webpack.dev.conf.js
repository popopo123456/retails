'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const env = require('./env')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')
const ip = require('ip')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const config = require('./index')
const mockData = require('./mock.json')

const devWebpackConfig = merge(baseWebpackConfig, {
  entry: { app: `./src/${config.fileName}/main.js` },
  module: {
    rules: utils.styleLoaders({ sourceMap: env.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: env.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    // before(app) {
    //   Object.keys(mockData).forEach(name => {
    //     app.all(name, function(req, res) {
    //       res.json({
    //         errno: 0,
    //         data: mockData[name]
    //       })
    //     });
    //   })
    // },
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(env.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || env.dev.host,
    port: PORT || env.dev.port,
    open: env.dev.autoOpenBrowser,
    overlay: env.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: env.dev.assetsPublicPath,
    proxy: env.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: env.dev.poll,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"',
      BUILD_ENV: JSON.stringify(process.env.BUILD_ENV || 'dev')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, `../src/${config.fileName}/index.html`)
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: env.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ]),
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || env.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          // messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
          messages: [`Your application is running here:`,
            ``,
            `Local:            http://${devWebpackConfig.devServer.host}:${port}`,
            `On your Network : http://${ip.address()}:${port}`
          ]
        },
        onErrors: env.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      if (env.dev.showPageSkeleton) {
        const { SkeletonPlugin } = require('page-skeleton-webpack-plugin')
        devWebpackConfig.plugins.push(new SkeletonPlugin({
          pathname: path.resolve(__dirname, `../shell`), // 用来存储 shell 文件的地址
          staticDir: path.resolve(__dirname, '../dist'), // 最好和 `output.path` 相同
          routes: ['/'],
          port: '7890',
          loading: 'chiaroscuro',
          svg: {
            color: '#EFEFEF',
            shape: 'circle',
            shapeOpposite: ['.Rating-gray_1kpffd5_0 svg']
          },
          image: {
            shape: 'rect', // `rect` | `circle`
            color: '#EFEFEF',
            shapeOpposite: ['.mint-swipe-items-wrap img']
          },
          pseudo: {
            color: '#EFEFEF', // or transparent
            shape: 'circle', // circle | rect
            shapeOpposite: ['.delivery-icon-hollow_3q8_B5r_0', '.index-premium_39rl0v9']
          },
          button: {
            color: '#EFEFEF',
            excludes: ['.mint-swipe-items-wrap a']
          },
          defer: 5000,
          excludes: [],
          remove: [],
          hide: ['.index-dashedline_7B79b3W', '.Rating-actived_GBtiHkB_0'],
          grayBlock: ['#header'],
          cssUnit: 'rem',
          headless: true,
          // minify: false,
          noInfo: false
        }))
      }

      resolve(devWebpackConfig)
    }
  })
})
