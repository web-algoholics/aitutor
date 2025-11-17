// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
    publicPath: '/',
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  module: {
    rules: [
      // ---------- JSX ----------
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },

      // ---------- YOUR CSS (Tailwind) ----------
      {
        test: /\.css$/i,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { importLoaders: 1 },
          },
          'postcss-loader',  // ← Applies @tailwindcss/postcss
        ],
      },

      // ---------- node_modules CSS (AntD, etc.) ----------
      {
        test: /\.css$/i,
        include: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },

      // ---------- LESS (Ant Design) ----------
      {
        test: /\.less$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: { lessOptions: { javascriptEnabled: true } },
          },
        ],
      },

      // ---------- Images ----------
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),

    // ---- ENV VAR ----
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_URL': JSON.stringify(
        process.env.REACT_APP_API_URL || 'http://localhost:8000'
      ),
    }),

    // ---- HMR ----
    new webpack.HotModuleReplacementPlugin(),
  ],

  devServer: {
    static: path.join(__dirname, 'public'),
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },

  devtool: 'cheap-module-source-map',
};