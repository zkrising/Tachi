import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import fs from "fs";
import path from "path";

const toplevelDirs = fs
	.readdirSync(path.join(__dirname, "src/"), { withFileTypes: true })
	.filter((e) => e.isDirectory())
	.map((e) => e.name);

export default defineConfig(({ mode }) => {
	// load .env.{mode} (.env & .env.development or .env.production by default)
	const env = loadEnv(mode, process.cwd(), "");
	// Determines which stylesheet gets loaded, kamai by default.
	let styleMode = `./src/_style/tachi/colors/kamai.scss`;

	if (env.VITE_TCHIC_MODE === "btchi") {
		styleMode = `./src/_style/tachi/colors/boku.scss`;
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
				{
					find: /@fonts/u,
					replacement: env.VITE_IS_LOCAL_DEV
						? path.resolve(__dirname, "src", "_assets", "fonts")
						: "./static/fonts",
				},
			],
		},
		define: {
			"process.env": env,
		},
		plugins: [
			react(),
			createHtmlPlugin({
				inject: {
					data: {
						VITE_CDN_URL: env.VITE_CDN_URL,
						TACHI_NAME: env.TACHI_NAME ?? "Tachi",
						VITE_ADDITIONAL_HEAD: env.VITE_GOATCOUNTER
							? `<script data-goatcounter="${env.VITE_GOATCOUNTER}" async src="//gc.zgo.at/count.js"></script>`
							: "",
					},
				},
			}),
		],
		server: {
			port: 3000,
			host: true,
			watch: {
				usePolling: env.FORCE_FS_POLLING,
			},
		},
		preview: {
			port: 3000,
		},
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `@import "${styleMode}";`,
				},
			},
		},
		build: {
			assetsDir: "static",
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			outDir: env.BUILD_OUT_DIR || "build",
			sourcemap: true,
		},
	};
});
