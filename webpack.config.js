const fs											= require('fs');
const path										= require('path');
const { BannerPlugin }				= require('webpack');
const { CleanWebpackPlugin }	= require('clean-webpack-plugin');
const PostCompile							= require('post-compile-webpack-plugin')

const config = {
	target: 'node',
	entry: {
		index: './src/index.js'
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'index.js'
	},
	watchOptions: {
		aggregateTimeout: 600,
		ignored: /node_modules/
	},
	plugins: [
		new CleanWebpackPlugin({
			cleanStaleWebpackAssets: false,
			cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, './dist')]
		}),
		new BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
		new PostCompile(() => fs.chmodSync('dist/index.js', '755'))
	],
	module: {
		rules: [
			{
				test: /\.js(x?)$/,
				exclude: [/node_modules/, /test/],
				use: ['babel-loader']
			},
			{
				test: /\.node$/,
				loader: 'node-loader',
			}
		]
	},
	experiments: { topLevelAwait: true },
	resolve: {
		extensions: ['.js']
	}
};

module.exports = (env, argv) => {
	if (argv.mode === 'development') {
		// * add some development rules here
	} else if (argv.mode === 'production') {
		// * add some prod rules here
	} else {
		throw new Error('Specify env');
	}

	return config;
};