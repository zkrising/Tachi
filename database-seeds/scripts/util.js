const fs = require("fs");
const path = require("path");
const DeterministicCollectionSort = require("./deterministic-collection-sort");
const crypto = require("crypto");
const fjsh = require("fast-json-stable-hash");

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

function CreateFolderID(
	query,
	game,
	playtype
) {
	return `F${fjsh.hash(Object.assign({ game, playtype }, query), "SHA256")}`;
}


module.exports = {
	IterateCollections,
	MutateCollection,
	CreateChartID,
	CreateFolderID
}