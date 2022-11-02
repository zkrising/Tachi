const { FormatGame } = require("tachi-common");
const { MutateCollection, CreateFolderID } = require("../util");

module.exports = function AddLevelVersionFolders(name, game, playtypes, version, levels) {
	const ptFolders = {};

	MutateCollection("folders.json", (folders) => {
		for (const level of levels) {
			const folder = {
				title: `Level ${level} (${name})`,
				game,
				type: "charts",
				data: {
					level,
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
				tableID: `${game}-${playtype}-${version}-levels`,
				title: `${FormatGame(game, playtype)} (${name})`,
				description: `Levels for ${FormatGame(game, playtype)} in ${name}.`,
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

// usage:

// const levels = [];
// for (let i = 1; i <= 12; i++) {
// 	levels.push(i.toString())
// }
//
// AddLevelVersionFolders("CastHour", "iidx", ["SP", "DP"], "29", levels);
