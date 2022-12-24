import react from "@vitejs/plugin-react";
import { config } from "dotenv";
import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

config();

const toplevelDirs = fs
	.readdirSync(path.join(__dirname, "src/"), { withFileTypes: true })
	.filter((e) => e.isDirectory())
	.map((e) => e.name);

export default defineConfig(() => {
	let COLOUR_SET;

	if (process.env.VITE_TCHIC_MODE === "ktchi" || process.env.VITE_TCHIC_MODE === "omni") {
		// kamai colours
		COLOUR_SET = `$tachi-primary: #e61c6e;
		$tachi-primary-hover: #de6589;
		$tachi-background: #131313;
		$tachi-lightground: #2b292b;
		$tachi-backestground: #000000;
		$tachi-overground: #524e52;
		
		$tachi-info: #527acc;
		$tachi-info-hover: #8da7dd;`;
	} else {
		// boku colours
		COLOUR_SET = `$tachi-primary: #527acc;
		$tachi-primary-hover: #8da7dd;
		$tachi-background: #131313;
		$tachi-lightground: #2b292b;
		$tachi-backestground: #000000;
		$tachi-overground: #524e52;
	
		$tachi-info: #31497A;
		$tachi-info-hover: #455B87;`;
	}

	// This is dynamically inserted into the head of _style/base.scss, on the first line.
	let scssEntryPoint;

	// If you have access to the private metronic scss submodule
	// and have cloned it, use that.
	if (fs.existsSync(path.join(__dirname, "./src/_assets/metronic-scss/style.react.scss"))) {
		scssEntryPoint = "./_assets/metronic-scss/style.react.scss";
	} else {
		// Else, use some default compiled css.
		scssEntryPoint = "./_assets/compiled-css/main.css";
	}

	return {
		resolve: {
			alias: [
				{
					find: /^tachi-common(.*)$/u,
					replacement: path.resolve(__dirname, "../common/src", "$1"),
				},
				{
					find: new RegExp(`^((${toplevelDirs.join("|")}).*)$`, "u"),
					replacement: path.resolve(__dirname, "src", "$1"),
				},
			],
		},
		define: {
			"process.env": process.env,
		},
		plugins: [react()],
		server: {
			port: 3000,
		},
		preview: {
			port: 3000,
		},
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `${COLOUR_SET}\n@import "${scssEntryPoint}";`,
				},
			},
		},
		build: {
			assetsDir: "static",
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			outDir: process.env.BUILD_OUT_DIR || "build",
			sourcemap: true,
		},
	};
});
