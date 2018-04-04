// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')
// const host = require('./dev.env').NODE_ENV == 'development' ? '127.0.0.1:3300' : '47.95.223.100:3300';
const host = '127.0.0.1:3300'
module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: false,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css']
  },
  dev: {
    env: require('./dev.env'),
    port: 8089,
    proxyTable: {
      '/api/*': 'http://' + host,
      '/api/*/*': 'http://' + host,
      '/api/*/*/*': 'http://' + host,
      '/login': 'http://' + host
    }
  }
}