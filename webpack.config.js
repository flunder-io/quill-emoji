const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const config = {
  entry: './src/quill-emoji.js',
  output: {
    filename: 'quill-emoji.js',
    path: path.resolve(__dirname, 'dist'),
    library: "QuillEmoji",
    libraryTarget: "umd"
  },
  devtool: "source-map",
  target: "web",
  mode: "production",
  externals: {
    quill: {
      commonjs: 'quill',
      commonjs2: 'quill',
      amd: 'quill',
      root: 'Quill'
    }
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            }
          },
          {
            loader: 'resolve-url-loader',
            options: {
              sourceMap: true,
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            }
          },
        ],
      },
      {
        test: /\.(jpg|png|gif)$/i,
        include: /src/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ],
      },
    ]
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: true,
        terserOptions: {
          ecma: 7,
          output: {
            comments: false,
            max_line_len: 100,
          },
          keep_classnames: true,
          keep_fnames: true,
          safari10: true, // ... work around Safari 10/11 bugs
        }
      }),
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'quill-emoji.css',
      chunkFilename: '[id].css',
    })
  ],
};

module.exports = config;
