const fs = require("fs");
const path = require("path");

const collections = fs.readdirSync(path.join(__dirname, "../collections"));

function ChartSort(a, b) {
	if (a.songID !== b.songID) {
		return a.songID - b.songID;
	}

	if (a.playtype !== b.playtype) {
		return a.playtype.localeCompare(b.playtype);
	}

	if (a.difficulty !== b.difficulty) {
		return a.difficulty.localeCompare(b.difficulty);
	}

	return 0;
}

for (const collection of collections) {
	const collPath = path.join(__dirname, "../collections", collection);
	const content = JSON.parse(fs.readFileSync(collPath));

	if (collection.startsWith("charts-")) {
		content.sort(ChartSort);
	}
	if (collection.startsWith("songs-")) {
		content.sort((a, b) => a.id - b.id);
	}

	fs.writeFileSync(collPath, JSON.stringify(content, null, "\t"));
}