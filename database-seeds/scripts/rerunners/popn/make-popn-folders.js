const { MutateCollection, CreateFolderID } = require("../../util");

const tableMainFolders = [];
const tableAllFolders = [];

const { Command } = require("commander");

const program = new Command();
program.requiredOption("-v, --version <version>");

program.parse(process.argv);
const options = program.opts();

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
			title: `Level ${lb}-${ub} (${options.version})`,
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
			title: `Level ${i} (${options.version})`,
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
		title: `Pop'n Music ${options.version} All Levels`,
		description: `All pop'n ${options.version} levels individually.`,
		tableID: `popn-9B-${options.version}-alllevels`,
		playtype: "9B",
		game: "popn",
		inactive: false,
		folders: tableAllFolders,
	});

	tables.push({
		title: `Pop'n Music ${options.version} Levels`,
		description: `All pop'n ${options.version} levels, with some folders joined together.`,
		tableID: `popn-9B-${options.version}-levels`,
		playtype: "9B",
		game: "popn",
		inactive: false,
		folders: tableMainFolders,
	});

	return tables;
});
