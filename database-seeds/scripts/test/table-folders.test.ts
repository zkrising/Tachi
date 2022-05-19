import chalk from "chalk";
import { FolderDocument, TableDocument } from "tachi-common";
import { ReadCollection } from "../util";
import { FormatFunctions } from "./test-utils";

let success = 0;
let fails = 0;

const folders = ReadCollection("folders.json", true) as FolderDocument[];

const folderMap = new Map<string, FolderDocument>();
for (const folder of folders) {
	folderMap.set(folder.folderID, folder);
}

const tables = ReadCollection("tables.json", true) as TableDocument[];

for (const table of tables) {
	const pretty = FormatFunctions.tables!(table);

	for (const folderID of table.folders) {
		if (!folderMap.get(folderID)) {
			console.error(
				chalk.red(
					`[ERR] | ${pretty} | FolderID ${folderID} is referred to in table ${table.title}, but doesn't exist.`
				)
			);

			fails++;
		} else {
			success++;
		}
	}
}

console.log(chalk[fails === 0 ? "green" : "red"](`[FOLDER_ID]: ${success} good, ${fails} bad.`));

if (fails !== 0) {
	console.log(
		chalk.red(
			"Some tables refer to folders that do not exist, perhaps checking git history will help find out what they were?"
		)
	);
}

process.exit(fails !== 0 ? 1 : 0);
