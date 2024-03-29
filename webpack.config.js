var path = require('path');
var webpack = require("webpack");

module.exports = { 
 	entry: {
		monkeyChat: './monkeychat.js',
		monkeyUI: './monkeyui.js'
  	},
  	output: {
    	path: path.join(__dirname, 'dist'),
		publicPath: '/monkeychat/dist/',
		filename: '[name].js'
  	},

  	externals: {
    	monkey:"monkey"
		//  on the global var jQuery
  	},

  	module: {
		preloaders: [{ 
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'jshint-loader'
      	}],
    loaders: [{ 
	    test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
        	presets: ['es2015']
    	}
	    }, { 
		    test: /\.css$/,
	        loader: "style!css"
	    }, { 
		    test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
	        loader: "file?name=[name].[ext]&limit=10000&mimetype=application/font-woff"
	    }, {
	        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
	        loader: "file?name=[name].[ext]&limit=10000&mimetype=application/font-woff"
	    }, {
	        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
	        loader: "file?name=[name].[ext]&limit=10000&mimetype=application/octet-stream"
	    }, {
	        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
	        loader: "file?name=[name].[ext]"
	    }, {
	        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
	        loader: "file?name=[name].[ext]&limit=10000&mimetype=image/svg+xml"
	    }]
  	},
  
	plugins: [
	    new webpack.ProvidePlugin({
	        $: "jquery",
	        jQuery: "jquery",
	        'window.jQuery': 'jquery',
	    })
	]
};