const { Command } = require("commander");
const { GetGamePTConfig } = require("tachi-common");
const { CreateFolderID, MutateCollection, ReadCollection } = require("../../util");

const LEVELS = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"7+",
	"8",
	"8+",
	"9",
	"9+",
	"10",
	"10+",
	"11",
	"11+",
	"12",
	"12+",
	"13",
	"13+",
	"14",
	"14+",
	"15",
	"15+",
];
const DIFFICULTIES = ["BASIC", "ADVANCED", "EXPERT", "MASTER", "ULTIMA", "MASTER+ULTIMA"];

const existingFolderIDs = new Set(ReadCollection("folders.json").map((f) => f.folderID));

const command = new Command().requiredOption("-v, --version <version>").parse(process.argv);
const options = command.opts();
const version = options.version;

const tachiVersions = GetGamePTConfig("chunithm", "Single").versions;
const versionName = tachiVersions[version];

if (!versionName) {
	throw new Error(
		`Invalid version of ${version}. Please update game config before adding tables and folders.`
	);
}

const newFolders = [];
const levelFolderIDs = [];
const difficultyFolderIDs = [];

for (const level of LEVELS) {
	const data = { level, versions: version };
	const folderID = CreateFolderID(data, "chunithm", "Single");

	levelFolderIDs.push(folderID);

	if (existingFolderIDs.has(folderID)) {
		continue;
	}

	newFolders.push({
		data,
		folderID,
		game: "chunithm",
		inactive: false,
		playtype: "Single",
		searchTerms: [],
		title: `Level ${level} (${versionName})`,
		type: "charts",
	});
	existingFolderIDs.add(folderID);
}

for (const difficulty of DIFFICULTIES) {
	const data = { versions: version };

	if (difficulty === "MASTER+ULTIMA") {
		data.difficulty = { "~in": ["MASTER", "ULTIMA"] };
	} else {
		data.difficulty = difficulty;
	}

	const folderID = CreateFolderID(data, "chunithm", "Single");

	difficultyFolderIDs.push(folderID);

	if (existingFolderIDs.has(folderID)) {
		continue;
	}

	newFolders.push({
		data,
		folderID,
		game: "chunithm",
		inactive: false,
		playtype: "Single",
		searchTerms: [],
		title: `${difficulty} (${versionName})`,
		type: "charts",
	});

	existingFolderIDs.add(folderID);
}

MutateCollection("tables.json", (ts) => {
	const filtered = ts.filter(
		(t) =>
			t.tableID !== `chunithm-Single-${version}-levels` &&
			t.tableID !== `chunithm-Single-${version}-difficulties`
	);

	filtered.push(
		{
			default: false,
			description: `Levels for CHUNITHM in ${versionName}.`,
			folders: levelFolderIDs,
			game: "chunithm",
			inactive: false,
			playtype: "Single",
			tableID: `chunithm-Single-${version}-levels`,
			title: `CHUNITHM (${versionName})`,
		},
		{
			default: false,
			description: `Difficulties for CHUNITHM in ${versionName}.`,
			folders: difficultyFolderIDs,
			game: "chunithm",
			inactive: false,
			playtype: "Single",
			tableID: `chunithm-Single-${version}-difficulties`,
			title: `CHUNITHM (${versionName}) (Difficulties)`,
		}
	);

	return filtered;
});

MutateCollection("folders.json", (fs) => [...fs, ...newFolders]);
