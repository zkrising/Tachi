import db from "external/mongo/db";

(async () => {
	const folders = await db.folders.find({}, { sort: { tableIndex: 1 } });

	for (const folder of folders) {
		const { game, playtype } = folder;

		const tableID = ((folder as any).table as string)
			.toLowerCase()
			.replace(/ /gu, "_")
			.replace(/\(/gu, "")
			.replace(/\)/gu, "");

		console.log(game, playtype, tableID, folder.title);

		const existingTable = await db.tables.findOne({ game, playtype, tableID });

		if (!existingTable) {
			await db.tables.insert({
				tableID,
				game,
				playtype,
				description: "todo",
				folders: [folder.folderID],
				// @ts-expect-error yea
				title: folder.table,
			});
		} else {
			await db.tables.update(
				{
					game,
					playtype,
					tableID,
				},
				{
					$push: {
						folders: folder.folderID,
					},
				}
			);
		}
	}
})();
