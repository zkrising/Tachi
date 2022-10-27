const fs = require("fs");
const path = require("path");
const DeterministicCollectionSort = require("./deterministic-collection-sort");
const crypto = require("crypto");
const fjsh = require("fast-json-stable-hash");

function IterateCollections(cb) {
	for (const collection of fs.readdirSync(COLLECTIONS_DIR)) {
		const data = cb(
			JSON.parse(fs.readFileSync(path.join(COLLECTIONS_DIR, collection))),
			collection
		);

		fs.writeFileSync(path.join(COLLECTIONS_DIR, collection), JSON.stringify(data, null, "\t"));
	}

	DeterministicCollectionSort();
}

const COLLECTIONS_DIR = path.join(__dirname, "../collections");

function ReadCollection(name, throwIfNotFound = false) {
	const p = path.join(COLLECTIONS_DIR, name);
	if (!fs.existsSync(p)) {
		if (throwIfNotFound) {
			throw new Error(`No collection ${name} exists.`);
		}

		fs.writeFileSync(p, JSON.stringify([]));
		return [];
	}

	return JSON.parse(fs.readFileSync(p));
}

function WriteCollection(name, data) {
	fs.writeFileSync(path.join(COLLECTIONS_DIR, name), JSON.stringify(data, null, "\t"));

	DeterministicCollectionSort();
}

function MutateCollection(name, cb) {
	const data = cb(ReadCollection(name));

	if (data === undefined) {
		throw new Error(`You forgot to return from your MutateCollection function.`);
	}

	WriteCollection(name, data);
}

function CreateChartID() {
	return crypto.randomBytes(20).toString("hex");
}

function CreateFolderID(query, game, playtype) {
	return `F${fjsh.hash(Object.assign({ game, playtype }, query), "SHA256")}`;
}

// quick inplace deepmerge hack
// probably doesn't work for arrays, i don't care though.
function EfficientInPlaceDeepmerge(ref, apply) {
	for (const key in apply) {
		if (typeof apply[key] === "object" && apply[key]) {
			EfficientInPlaceDeepmerge(ref[key], apply[key]);
		} else {
			ref[key] = apply[key];
		}
	}
}

/**
 * Given a game, reads the songs-${game}.json collection, gets the largest song ID, and
 * returns a generator that will give an unused songID when called.
 *
 * Not thread safe.
 */
function GetFreshScoreIDGenerator(game) {
	let maxSongID = ReadCollection(`songs-${game}.json`).sort((a, b) => b.id - a.id)[0].id;

	return () => ++maxSongID;
}

module.exports = {
	IterateCollections,
	MutateCollection,
	CreateChartID,
	CreateFolderID,
	ReadCollection,
	WriteCollection,
	EfficientInPlaceDeepmerge,
	GetFreshScoreIDGenerator,
};
