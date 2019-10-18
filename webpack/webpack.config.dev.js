const path = require('path');
const merge = require('webpack-merge');
const commonConfig = require('./webpack.config.common');

const devConfig = {
  mode: 'development',
  // 追踪到错误和警告在源代码中的原始位置
  devtool: 'inline-source-map',
  entry: {
    app: [
      'babel-polyfill',
      path.resolve(__dirname, '../src/index.js')]
  },
  output: {
    /*这里本来应该是[chunkhash]的，
    但是由于[chunkhash]和react-hot-loader不兼容。只能妥协*/
    filename: '[name].[hash].js'
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    contentBase: path.resolve(__dirname, '../dist'),
    historyApiFallback: { index: '/public/index.html' },
    publicPath: '/public/',
    overlay: {
      errors: true
    },
    disableHostCheck: true,
  },
};

module.exports = merge({
  customizeArray(a, b, key) {
    /*entry.app不合并，全替换*/
    if (key === 'entry.app') {
      return b;
    }
    return undefined;
  }
})(commonConfig, devConfig);
