const { MutateCollection, CreateFolderID } = require("../../util");

const PLAYTYPES = ["SP", "DP"];
const VERSIONS = ["konaste", "a3", "a20plus", "a20", "a"];
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
	for (const ver of VERSIONS) {
		for (const level of LEVELS) {
			const folder = {
				title: `Level ${level} (${ver})`,
				game: "ddr",
				type: "charts",
				data: {
					level,
					versions: ver,
				},
				inactive: false,
				searchTerms: [],
			};

			for (const playtype of PLAYTYPES) {
				const folderID = CreateFolderID(folder.data, folder.game, playtype);

				const realFolder = Object.assign({ playtype, folderID }, folder);

				if (!ptFolders[playtype]) {
					ptFolders[playtype] = [];
				}

				if (!ptFolders[playtype][ver]) {
					ptFolders[playtype][ver] = [];
				}
				ptFolders[playtype][ver].push(realFolder);

				foldersCol.push(realFolder);
			}
		}
	}
	return foldersCol;
});

MutateCollection("tables.json", (tables) => {
	for (const playtype of PLAYTYPES) {
		for (const ver of VERSIONS) {
			tables.push({
				tableID: `ddr-${playtype}-${ver}`,
				title: `DDR (${playtype}) (${ver})`,
				description: `Levels for DDR (${playtype}) in ${ver}`,
				folders: ptFolders[playtype][ver].map((e) => e.folderID),
				game: "ddr",
				playtype,
				inactive: false,
				default: false,
			});
		}
	}
	return tables;
});
