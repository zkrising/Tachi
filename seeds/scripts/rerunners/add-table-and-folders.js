const { MutateCollection, CreateFolderID } = require("../util");

// Change these for whatever table you are adding.
const GAME = "ddr";
const PLAYTYPES = ["SP", "DP"];
const PREFIX = "Level ";
const TITLE = "DDR A3";
const SHORTTITLE = "a3"; // this is used in the tableID
const DESCRIPTION = "All songs in DDR A3";
const LEVELS = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"11",
	"12",
	"13",
	"14",
	"15",
	"16",
	"17",
	"18",
	"19",
];

const ptFolders = {};

MutateCollection("folders.json", (foldersCol) => {
	for (const level of LEVELS) {
		const folder = {
			title: `${PREFIX}${level}`,
			game: GAME,
			type: "charts",
			data: {
				"data¬tableFolders": {
					"~elemMatch": {
						table: PREFIX,
						level,
					},
				},
			},
			inactive: false,
			searchTerms: [],
		};

		for (const playtype of PLAYTYPES) {
			const folderID = CreateFolderID(folder.data, folder.game, playtype);

			const realFolder = Object.assign({ playtype, folderID }, folder);

			if (ptFolders[playtype]) {
				ptFolders[playtype].push(realFolder);
			} else {
				ptFolders[playtype] = [realFolder];
			}

			foldersCol.push(realFolder);
		}
	}

	return foldersCol;
});

MutateCollection("tables.json", (tables) => {
	for (const playtype of PLAYTYPES) {
		tables.push({
			tableID: `${GAME}-${playtype}-${SHORTTITLE}`,
			title: TITLE,
			description: DESCRIPTION,
			folders: ptFolders[playtype].map((e) => e.folderID),
			game: GAME,
			playtype,
			inactive: false,
			default: false,
		});
	}

	return tables;
});
