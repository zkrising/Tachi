import glob from "glob";

const files = glob.sync("**/*.test.ts");

for (const file of files) {
	require(file);
}
