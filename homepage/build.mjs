import sass from "node-sass";
import { resolve } from "node:path";
import {
	existsSync,
	mkdirSync,
	writeFileSync,
	watch,
	copyFileSync,
} from "node:fs";

const sourceDirectory = resolve(".", "src");
const outDirectory = resolve(".", "dist");

const styleSheetInput = resolve(sourceDirectory, "style.scss");
const htmlInput = resolve(sourceDirectory, "index.html");

const styleSheetOutput = resolve(outDirectory, "style.css");
const htmlOutput = resolve(outDirectory, "index.html");

const compile = () => {
	console.time("Compiled site");
	if (!existsSync(outDirectory)) {
		mkdirSync(outDirectory);
	}

	const result = sass.renderSync({
		file: styleSheetInput,
	});
	writeFileSync(styleSheetOutput, result.css);

	copyFileSync(htmlInput, htmlOutput);

	console.timeEnd("Compiled site");
};

const debounce = 100; // Watch debounce time in MS
let lastCompileTime = Date.now();
(() => {
	if (process.argv.includes("--watch")) {
		console.info("Enabling Watcher...");

		watch(sourceDirectory, (event, filename) => {
			if (event === "change" && Date.now() - lastCompileTime > debounce) {
				console.info(`${filename} ${event}`);

				compile();
				lastCompileTime = Date.now();
			}
		});
	}

	compile();
})();
