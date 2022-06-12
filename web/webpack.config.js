const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

const webpack = require('webpack')
const webpackDevServer = require('webpack-dev-server')

const publicPath = (resourcePath, context) =>
  path.relative(path.dirname(resourcePath), context) + '/'

/**
 * @type {webpack.Configuration}
 */
module.exports = {
  entry: {
    app: './src/index.tsx',
    'antd-style': './node_modules/antd/dist/antd.css',
    'theme-style': './src/styles/theme.less',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  output: {
    filename: '[name].min.js',
    path: path.join(__dirname, 'build'),
  },
  /**
   * @type {webpackDevServer.Configuration}
   */
  devServer: {
    devMiddleware: {
      writeToDisk: true,
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: ['babel-loader'],
      },
      {
        test: /\.(woff|svg|eot|ttf|png)$/,
        use: ['url-loader'],
      },
      {
        test: /\.(css|less)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { publicPath },
          },
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'template.html'),
      chunks: ['app', 'antd-style'],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].min.css',
    }),
    new webpack.ProgressPlugin(),
  ],
  watchOptions: {
    aggregateTimeout: 1000,
    ignored: /node_modules|lib/,
  },
}
