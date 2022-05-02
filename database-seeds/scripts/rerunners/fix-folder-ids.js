const { MutateCollection, CreateFolderID } = require("../util");

MutateCollection("folders.json", (folders) => {
	for (const folder of folders) {
		folder.folderID = CreateFolderID(folder.data, folder.game, folder.playtype);
	}

	return folders;
});
