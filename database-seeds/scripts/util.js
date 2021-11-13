const fs = require("fs");
const path = require("path");
const DeterministicCollectionSort = require("./deterministic-collection-sort");
const crypto = require("crypto");

function IterateCollections(cb) {
	const main = path.join(__dirname, "../collections");

	for (const collection of fs.readdirSync(main)) {
		const data = cb(JSON.parse(fs.readFileSync(path.join(main, collection))), collection);

		fs.writeFileSync(path.join(main, collection), JSON.stringify(data, null, "\t"));
	}

	DeterministicCollectionSort();
}

function MutateCollection(name, cb) {
	const main = path.join(__dirname, "../collections");

	const data = cb(JSON.parse(fs.readFileSync(path.join(main, name))));

	fs.writeFileSync(path.join(main, name), JSON.stringify(data, null, "\t"));

	DeterministicCollectionSort();
}

function CreateChartID() {
	return crypto.randomBytes(20).toString("hex");
}

module.exports = {
	IterateCollections,
	MutateCollection,
	CreateChartID,
}