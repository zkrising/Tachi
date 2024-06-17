const { FormatGame } = require("tachi-common");
const { MutateCollection, CreateFolderID } = require("../util");

module.exports = function AddDifficultyVersionFolders(
	name,
	game,
	playtypes,
	version,
	difficulties
) {
	const ptFolders = {};

	MutateCollection("folders.json", (folders) => {
		for (const difficulty of difficulties) {
			const folder = {
				title: `${difficulty} (${name})`,
				game,
				type: "charts",
				data: {
					difficulty,
					versions: version,
				},
				inactive: false,
				searchTerms: [],
			};

			for (const playtype of playtypes) {
				const folderID = CreateFolderID(folder.data, folder.game, playtype);

				const realFolder = Object.assign({ playtype, folderID }, folder);

				if (ptFolders[playtype]) {
					ptFolders[playtype].push(realFolder);
				} else {
					ptFolders[playtype] = [realFolder];
				}

				folders.push(realFolder);
			}
		}

		return folders;
	});

	MutateCollection("tables.json", (tables) => {
		for (const playtype of playtypes) {
			tables.push({
				tableID: `${game}-${playtype}-${version}-difficulties`,
				title: `${FormatGame(game, playtype)} (${name})`,
				description: `Difficulties for ${FormatGame(game, playtype)} in ${name}.`,
				folders: ptFolders[playtype].map((e) => e.folderID),
				game,
				playtype,
				inactive: false,
				default: false,
			});
		}

		return tables;
	});
};

module.exports("NEW PLUS", "chunithm", ["Single"], "newplus", ["BASIC", "ADVANCED", "EXPERT", "MASTER", "ULTIMA"]);

// usage:

// const levels = [];
// for (let i = 1; i <= 12; i++) {
// 	levels.push(i.toString())
// }

// AddLevelVersionFolders("CastHour", "iidx", ["SP", "DP"], "29", levels);
