import { BMSTablesDataset, UpdateTable } from "./table-sync";
import { BMS_TABLES } from "lib/constants/bms-tables";

// I have no confidence in half of these links surviving.
// Eventually, some of these are going to disappear, and we'll have to find
// something else. probably.
const registeredTables: BMSTablesDataset[] = [
	{
		name: "Insane",
		humanisedPrefix: "insane",
		playtype: "7K",
		prefix: BMS_TABLES.insane,
		description: "The 7K GENOSIDE insane table.",
		url: "http://www.ribbit.xyz/bms/tables/insane_body.json",
	},
	{
		name: "Normal",
		humanisedPrefix: "normal",
		playtype: "7K",
		prefix: BMS_TABLES.normal,
		description: "The 7K GENOSIDE normal table.",
		url: "http://www.ribbit.xyz/bms/tables/normal_body.json",
	},
	{
		name: "Stella",
		humanisedPrefix: "st",
		playtype: "7K",
		prefix: BMS_TABLES.stella,
		description: "The stella table, from Stellaverse.",
		url: "https://stellabms.xyz/st/score.json",
	},
	{
		name: "Satellite",
		humanisedPrefix: "sl",
		playtype: "7K",
		prefix: BMS_TABLES.satellite,
		description: "The satellite table, from Stellaverse.",
		url: "https://stellabms.xyz/sl/score.json",
	},
	{
		name: "Insane2",
		humanisedPrefix: "insane2",
		playtype: "7K",
		prefix: BMS_TABLES.insane2,
		description: "A successor to the original insane table, but is generally less consistent.",
		url: "http://rattoto10.jounin.jp/js/insane_data.json",
	},
	{
		name: "Normal2",
		humanisedPrefix: "normal2",
		playtype: "7K",
		prefix: BMS_TABLES.normal2,
		description: "A successor to the original normal table.",
		url: "http://rattoto10.jounin.jp/js/score.json",
	},
	{
		name: "Overjoy",
		description: "The overjoy table. Level 1 is roughly equivalent to Insane 20.",
		humanisedPrefix: "overjoy",
		playtype: "7K",
		prefix: BMS_TABLES.overjoy,
		url: "http://lr2.sakura.ne.jp/data/score.json",
	},
	{
		name: "DP Insane",
		description: "The 14K Insane table.",
		humanisedPrefix: "dpInsane",
		prefix: BMS_TABLES.dpInsane,
		playtype: "14K",
		url: "http://dpbmsdelta.web.fc2.com/table/data/insane_data.json",
	},
	{
		name: "DP Normal",
		description: "The 14K Normal table, Sometimes called the delta table.",
		humanisedPrefix: "dpNormal",
		prefix: BMS_TABLES.dpNormal,
		playtype: "14K",
		url: "http://dpbmsdelta.web.fc2.com/table/data/dpdelta_data.json",
	},
	{
		name: "DP Satellite",
		description: "The 14K Satellite table.",
		humanisedPrefix: "dpSatellite",
		prefix: BMS_TABLES.satellite,
		playtype: "14K",
		url: "https://stellabms.xyz/dp/score.json",
	},
];

(async () => {
	for (const table of registeredTables) {
		// eslint-disable-next-line no-await-in-loop
		await UpdateTable(table);
	}

	process.exit(0);
})();
