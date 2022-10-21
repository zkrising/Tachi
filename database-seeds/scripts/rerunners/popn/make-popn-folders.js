const { MutateCollection, CreateFolderID } = require("../../util");

const tableMainFolders = [];
const tableAllFolders = [];

const { Command } = require("commander");
const { GetGamePTConfig } = require("tachi-common");
const { PrettyVersions } = require("tachi-common/config/static-config");

const program = new Command();
program.requiredOption("-v, --version <version>");

program.parse(process.argv);
const options = program.opts();

const fmtVersion = PrettyVersions["popn:9B"][options.version];

MutateCollection("folders.json", (folders) => {
	for (let i = 0; i < 3; i++) {
		const lb = 10 * i === 0 ? 1 : 10 * i;
		const ub = 10 * (i + 1) - 1;

		const folder = {
			data: {
				levelNum: {
					"~gte": lb,
					"~lte": ub,
				},
				versions: options.version,
			},
			game: "popn",
			inactive: false,
			playtype: "9B",
			searchTerms: [],
			title: `Level ${lb}-${ub} (${fmtVersion})`,
			type: "charts",
		};

		const folderID = CreateFolderID(folder.data, "popn", "9B");

		folder.folderID = folderID;

		tableMainFolders.push(folderID);
		folders.push(folder);
	}

	for (let i = 1; i <= 50; i++) {
		const folder = {
			data: {
				level: i.toString(),
				versions: options.version,
			},
			game: "popn",
			inactive: false,
			playtype: "9B",
			searchTerms: [],
			title: `Level ${i} (${fmtVersion})`,
			type: "charts",
		};

		const folderID = CreateFolderID(folder.data, "popn", "9B");

		folder.folderID = folderID;

		if (i > 30) {
			tableMainFolders.push(folderID);
		}

		tableAllFolders.push(folderID);

		folders.push(folder);
	}

	return folders;
});

MutateCollection("tables.json", (tables) => {
	tables.push({
		default: false,
		title: `Pop'n Music ${fmtVersion} All Levels`,
		description: `All pop'n ${fmtVersion} levels individually.`,
		tableID: `popn-9B-${options.version}-alllevels`,
		playtype: "9B",
		game: "popn",
		inactive: false,
		folders: tableAllFolders,
	});

	tables.push({
		default: false,
		title: `Pop'n Music ${fmtVersion} Levels`,
		description: `All pop'n ${fmtVersion} levels, with some folders joined together.`,
		tableID: `popn-9B-${options.version}-levels`,
		playtype: "9B",
		game: "popn",
		inactive: false,
		folders: tableMainFolders,
	});

	return tables;
});
