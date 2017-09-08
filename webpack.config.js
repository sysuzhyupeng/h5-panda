var path = require('path');
var webpack = require('webpack');

var PATHS = {
	app: path.join(__dirname, 'app/index'),
	build: path.join(__dirname, 'build')
};

var baseConfig = {
	entry: {
		app: PATHS.app,
	},
	output: {
		path: PATHS.build,
		filename: 'bundle.js'
	},
	module: {
		rules: [{
			test: /\.css$/,
			use: [{
				loader: 'style-loader'
			}, {
				loader: 'css-loader'
			}]
		}, {
			test: /\.less$/,
			use: [{
				loader: 'style-loader'
			}, {
				loader: 'css-loader'
			}, {
				loader: 'less-loader'
			}]
		}, {
			//识别url，将png替换成base64
			test: /\.jpg$/,
			use: [{
				loader: 'url-loader',
				query: {
					limit: 100000
				}
			}]
		},{
			//识别url，将png替换成base64
			test: /\.png$/,
			use: [{
				loader: 'url-loader',
				query: {
					limit: 100000
				}
			}]
		}]
	}
};
module.exports = baseConfig