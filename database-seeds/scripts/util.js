const fs = require("fs");
const path = require("path");
const DeterministicCollectionSort = require("./deterministic-collection-sort");
const crypto = require("crypto");
const fjsh = require("fast-json-stable-hash");
const glob = require("glob");

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

function MutateCollection(name, cb) {
	const data = cb(ReadCollection(name));

	fs.writeFileSync(path.join(COLLECTIONS_DIR, name), JSON.stringify(data, null, "\t"));

	DeterministicCollectionSort();
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

function AddSupportForBMSTable(header, game, playtype, tableName, tableID, tableDescription) {
	const folders = [];
	const symbol = header.symbol;

	for (const level of header.level_order) {
		const f = {
			title: `${symbol}${level}`,
			playtype,
			game,
			searchTerms: [],
			type: "charts",
			data: {
				"data¬tableFolders": {
					"~elemMatch": {
						level: level.toString(),
						table: symbol,
					},
				},
			},
			inactive: false,
		};

		const folderID = CreateFolderID(f);

		f.folderID = folderID;

		folders.push(f);
	}

	MutateCollection("folders.json", (f) => {
		f.push(...folders);
		return f;
	});

	MutateCollection("tables.json", (t) => {
		t.push({
			folders: folders.map((e) => e.folderID),
			game,
			playtype,
			inactive: false,
			description: tableDescription,
			title: tableName,
			tableID: tableID,
		});
		return t;
	});
}

module.exports = {
	IterateCollections,
	MutateCollection,
	CreateChartID,
	CreateFolderID,
	ReadCollection,
	EfficientInPlaceDeepmerge,
	AddSupportForBMSTable,
};
