var path = require('path');
module.exports = { 
  entry: path.join(__dirname, 'main.js'),
  
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/monkeyui/dist/',
    filename: 'monkeyChat.js'
  },

  externals: {
    monkey:"monkey"
    //  on the global var jQuery
  },

  module: {
    loaders: [
      { test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }//,
      // { test: /\.css$/,
      //   loader: "style!css"
      // }
    ]
  }
};