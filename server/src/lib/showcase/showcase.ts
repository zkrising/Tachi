import db from "external/mongo/db";

/**
 * When a folder is removed, any showcase stats referring to that folder
 * need to be changed aswell.
 */
export function RemoveStaleFolderShowcaseStats(removedFolderIDs: string[]) {
	return db["game-settings"].update(
		{},
		{
			$pull: {
				"preferences.stats": {
					mode: "folder",
					folderID: { $in: removedFolderIDs },
				},
			},
		},
		{
			multi: true,
		}
	);
}
