const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const rootPath = path.resolve(__dirname);
const distPath = `${rootPath}/dist`;

module.exports = {
	mode: "development",
	stats: "errors-only",
	performance: {
		hints: true,
	},
	entry: {
		"sass/style.react": "./src/index.scss",
	},
	output: {
		path: distPath,
		filename: "[name].js",
	},
	resolve: { extensions: [".scss"], },
	plugins: [
		new MiniCssExtractPlugin({
			filename: "[name].min.css",
		}),
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
	}
}
