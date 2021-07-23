const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const WorkboxPlugin = require('workbox-webpack-plugin');

const isDev = process.env.NODE_ENV === "development";

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body',
    }),
    new MiniCssExtractPlugin(),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    }),
    // idea is to automatically copy images from src/images to dist/images so they're available publicly
    // not working for some reason. tried all sorts of globs. not clear how to debug this.
    // adding a terminal command to the "deploy" script in the meantime.
    new CopyPlugin({
      patterns: [
        {
          context: __dirname + '/src',
          from: "images/twitter.png",
          to: __dirname + "/dist/images/twitter.png"
        },
      ],
    }),
  ],
  entry: './src/index.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: ''
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: "raw-loader"
      },
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        test: /\.js$/,
        loader: "source-map-loader"
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    esmodules: true,
                  }
                }
              ]
            ]
          }
        }
      },
      // {
      //   test: /\.(png|jpg)$/,
      //   use: {
      //     loader: 'url-loader',
      //     options: {
      //       name: '[name].[ext]',
      //       outputPath: '/images/'
      //     }
      //   }
      // },
      {
        test: /\.css$/,
        use: [isDev ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(woff(2)?)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: '/fonts/'
            }
          }
        ]
      },
    ]
  },
  resolve: {
    fallback: { stream: false },
    extensions: ['.ts', '.tsx', '.js']
  },
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
      !isDev && new TerserPlugin()
    ].filter(Boolean),
  },
  devServer: {
    open: true,
    watchOptions: {
      poll: true,
      ignored: "/node_modules/"
    },
    contentBase: path.join(__dirname, 'dist'),
  },
  devtool: 'source-map'
}