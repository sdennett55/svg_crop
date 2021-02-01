const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: path.resolve(__dirname, 'public')
  },
  module: {
    rules: [
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
      {
        test: /\.(png|jpg)$/,
        use: {
          loader: 'url-loader'
        }
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 9000,
    hot: true,
  }
}