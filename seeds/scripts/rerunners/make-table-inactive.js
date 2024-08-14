const { Command } = require("commander");
const { MutateCollection, ReadCollection, WriteCollection } = require("../util");

const program = new Command();
program.requiredOption("-t, --tableID <tableID>");

program.parse(process.argv);
const options = program.opts();

const tables = ReadCollection("tables.json");

let table;

for (const findTable of tables) {
	if (findTable.tableID === options.tableID) {
		table = findTable;
		findTable.inactive = true;
		break;
	}
}

if (!table) {
	throw new Error(`No such table ${options.tableID} exists.`);
}

MutateCollection("folders.json", (folders) => {
	for (const folder of folders) {
		if (table.folders.includes(folder.folderID)) {
			folder.inactive = true;
		}
	}

	return folders;
});

WriteCollection("tables.json", tables);
