const logger = require("../logger");
const {
	MutateCollection,
	CreateFolderID,
	ReadCollection,
	WriteCollection,
} = require("../util");

const translateMap = new Map();

const origFolders = ReadCollection("folders.json", true);

MutateCollection("folders.json", (folders) => {
	logger.info("Updating Folders.");

	for (const folder of folders) {
		const newFolderID = CreateFolderID(
			folder.data,
			folder.game,
			folder.playtype
		);

		translateMap.set(folder.folderID, newFolderID);

		folder.folderID = newFolderID;
	}

	return folders;
});

try {
	MutateCollection("tables.json", (tables) => {
		logger.info("Updating Tables.");

		for (const table of tables) {
			table.folders = table.folders.map((e) => {
				const newFolderID = translateMap.get(e);

				if (!newFolderID) {
					throw new Error(
						`${e} doesn't exist as a folderID? Can't autofix.`
					);
				}

				return newFolderID;
			});
		}

		logger.info("Done.");

		return tables;
	});
} catch (err) {
	logger.error(
		"Failed to update tables.json, reverting all auto-folder fixes.",
		{ err }
	);
	WriteCollection("folders.json", origFolders);
}
