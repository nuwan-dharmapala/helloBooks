const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.config');

const devConfig = {
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, 'client'),
    proxy: {
      '/api/v1/': 'http://127.0.0.1:4000/',
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      },
    })
  ],
};

module.exports = merge(common, devConfig);
