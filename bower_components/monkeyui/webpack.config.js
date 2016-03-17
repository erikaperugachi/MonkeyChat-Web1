var path = require('path');
var webpack = require('webpack');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

module.exports = { 
  entry: path.join(__dirname, 'main.js'),
  
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/monkeyui/dist/',
    filename: 'monkeyUI.js',
    library: "monkeyUI"
  },

  externals: {
    monkey:"monkey"
    //  on the global var jQuery
  },

  module: {
    preloaders: [
      { test: /\.js$/,
        exclude: /node_modules/,
        loader: 'jshint-loader'
      }
    ],
    loaders: [
      { test: /(MUIConversation\.js|MUIMessage\.js|MUIUser\.js|main\.js)$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.css$/,
        loader: 'style!css?sourceMap'
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?name=[name].[ext]&limit=10000&mimetype=application/font-woff"
      }, {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?name=[name].[ext]&limit=10000&mimetype=application/font-woff"
      }, {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?name=[name].[ext]&limit=10000&mimetype=application/octet-stream"
      }, {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file?name=[name].[ext]"
      }, {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: "url?name=[name].[ext]&limit=10000&mimetype=image/svg+xml"
      }, {
        test: /\.(otf)/,
        loader: 'url-loader?limit=8192'
      }, { 
        test:   /\.(png|jpe?g|svg)$/i,
        loader: 'url',
        query: {
          limit: 10000,
        }
      }
    ]
  },

  worker: {
    output: {
      filename: "ffmpeg.worker.js",
      chunkFilename: "[id].ffmpeg.worker.js"
    }
  },

  // plugins: [
  //   new uglifyJsPlugin({
  //     compress: {
  //       warnings: false
  //     }
  //   })
  // ]
};