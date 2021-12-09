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

function DeterministicCollectionSort() {
	for (const collection of collections) {
		const collPath = path.join(__dirname, "../collections", collection);
		let content = JSON.parse(fs.readFileSync(collPath));

		if (collection.startsWith("charts-")) {
			content.sort(ChartSort);
		}
		else if (collection.startsWith("songs-")) {
			content.sort((a, b) => a.id - b.id);
		}
		else if (collection.startsWith("folders")) {
			content.sort((a, b) => a.folderID.localeCompare(b.folderID));
		}
		else if (collection.startsWith("folders")) {
			content.sort((a, b) => a.tableID.localeCompare(b.tableID));
		}


		content = content.map(SortObjectKeys);

		fs.writeFileSync(collPath, JSON.stringify(content, null, "\t"));
	}
}

function SortObjectKeys(object) {
	let newObject = {};

	for (const key of Object.keys(object).sort()) {
		let v = object[key];

		if (typeof v === "object" && v && !Array.isArray(v)) {
			v = SortObjectKeys(v);
		}

		newObject[key] = v;
	}

	return newObject;
}

if (require.main === module) {
	DeterministicCollectionSort();
}

module.exports = DeterministicCollectionSort