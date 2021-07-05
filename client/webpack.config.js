const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackMessages = require("webpack-messages");
const del = require("del");

const rootPath = path.resolve(__dirname);
const distPath = `${rootPath}/src`;

module.exports = () => [{
	mode: "development",
	stats: "errors-only",
	performance: {
		hints: true,
	},
	entry: {
		"sass/style.react": "./src/index.scss",
	},
	output: {
		// main output path in assets folder
		path: distPath,
		// output path based on the entries' filename
		filename: "[name].js",
	},
	resolve: { extensions: [".scss"], },
	plugins: [
		new WebpackMessages({
			name: "tachi-client",
			logger: str => console.log(`>> ${str}`),
		}),
		new MiniCssExtractPlugin({
			filename: "[name].css",
		}),
		{
			apply: compiler => {
				compiler.hooks.afterEmit.tap("AfterEmitPlugin", compilation => {
					(async () => {
						await del.sync(`${distPath}/sass/*.js`, { force: true });
					})();
				});
			},
		},
	],
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
					{
						loader: "sass-loader",
						options: {
							sourceMap: true,
						},
					},
				],
			},
		],
	},
}];
