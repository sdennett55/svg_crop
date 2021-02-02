const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: ''
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
    open: true,
    watchOptions:{
      poll: true,
      ignored: "/node_modules/"
    }, 
    contentBase: path.join(__dirname, 'dist'),
  }
}