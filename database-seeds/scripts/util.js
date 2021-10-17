const fs = require("fs");
const path = require("path");
const DeterministicCollectionSort = require("./deterministic-collection-sort");

function IterateCollections(cb) {
	const main = path.join(__dirname, "../collections");

	for (const collection of fs.readdirSync(main)) {
		const data = cb(JSON.parse(fs.readFileSync(path.join(main, collection))));

		fs.writeFileSync(path.join(main, collection), JSON.stringify(data, null, "\t"));
	}

	DeterministicCollectionSort();
}

module.exports = {
	IterateCollections
}