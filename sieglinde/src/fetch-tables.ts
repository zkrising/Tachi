/* eslint-disable no-await-in-loop */
import fetch from "node-fetch";
import type { BMSTablesDataset, BMSTableChart } from "./types";

export const BMS_TABLES = {
	insane: "★",
	overjoy: "★★",
	normal: "☆",
	normal2: "▽",
	insane2: "▼",
	stella: "st",
	satellite: "sl",
	dpNormal: "δ",
	dpInsane: "★",
};

const registeredTables: Array<BMSTablesDataset> = [
	{
		name: "Insane",
		playtype: "7K",
		description: "The 7K GENOSIDE insane table.",
		url: "http://www.ribbit.xyz/bms/tables/insane_body.json",
		prefix: BMS_TABLES.insane,
	},
	{
		name: "Normal",
		playtype: "7K",
		description: "The 7K GENOSIDE normal table.",
		url: "http://www.ribbit.xyz/bms/tables/normal_body.json",
		prefix: BMS_TABLES.normal,
	},
	{
		name: "Stella",
		playtype: "7K",
		description: "The stella table, from Stellaverse.",
		url: "https://stellabms.xyz/st/score.json",
		prefix: BMS_TABLES.stella,
	},
	{
		name: "Satellite",
		playtype: "7K",
		description: "The satellite table, from Stellaverse.",
		url: "https://stellabms.xyz/sl/score.json",
		prefix: BMS_TABLES.satellite,
	},
	{
		name: "Insane2",
		playtype: "7K",
		description: "A successor to the original insane table, but is generally less consistent.",
		url: "http://rattoto10.jounin.jp/js/insane_data.json",
		prefix: BMS_TABLES.insane2,
	},
	{
		name: "Normal2",
		playtype: "7K",
		description: "A successor to the original normal table.",
		url: "http://rattoto10.jounin.jp/js/score.json",
		prefix: BMS_TABLES.normal2,
	},
	{
		name: "Overjoy",
		description: "The overjoy table. Level 1 is roughly equivalent to Insane 20.",
		playtype: "7K",
		url: "http://lr2.sakura.ne.jp/data/score.json",
		prefix: BMS_TABLES.overjoy,
	},

	// {
	// 	name: "DP Insane",
	// 	description: "The 14K Insane table.",
	// 	playtype: "14K",
	// 	url: "http://dpbmsdelta.web.fc2.com/table/data/insane_data.json",
	// },
	// {
	// 	name: "DP Normal",
	// 	description: "The 14K Normal table, Sometimes called the delta table.",
	// 	playtype: "14K",
	// 	url: "http://dpbmsdelta.web.fc2.com/table/data/dpdelta_data.json",
	// },
	// {
	// 	name: "DP Satellite",
	// 	description: "The 14K Satellite table.",
	// 	playtype: "14K",
	// 	url: "https://stellabms.xyz/dp/score.json",
	// },
];

export interface TableRes {
	table: BMSTablesDataset;
	charts: Array<BMSTableChart>;
}

export default async function GetTableData(): Promise<Array<TableRes>> {
	const out = [];

	// only 7k supported atm
	for (const table of registeredTables.filter((e) => e.playtype === "7K")) {
		const charts = await fetch(table.url).then((r) => r.json());

		out.push({ table, charts });
	}

	return out;
}
