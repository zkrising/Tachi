import chalk from "chalk";
import { FolderDocument } from "tachi-common";
import { CreateFolderID, ReadCollection } from "../util";
import { FormatFunctions } from "./test-utils";

let success = 0;
let fails = 0;

const folders = ReadCollection("folders.json", true) as FolderDocument[];

for (const folder of folders) {
	const pretty = FormatFunctions.folders!(folder);

	const expectedFolderID = CreateFolderID(folder.data, folder.game, folder.playtype);

	if (expectedFolderID !== folder.folderID) {
		console.error(
			chalk.red(
				`[ERR] | ${pretty} | Expected folderID to be ${expectedFolderID}. Got ${folder.folderID}.`
			)
		);

		fails++;
	} else {
		success++;
	}
}

console.log(chalk[fails === 0 ? "green" : "red"](`[FOLDER_ID]: ${success} good, ${fails} bad.`));

if (fails !== 0) {
	console.log(
		chalk.yellow("Run scripts/rerunners/fix-folder-ids.js to automatically fix these issues.")
	);
}

process.exit(fails !== 0 ? 1 : 0);
