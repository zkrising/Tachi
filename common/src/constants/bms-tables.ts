import type { Playtypes } from "../types";

export interface BMSTableInfo {
	prefix: string;

	/**
	 * Used to generate tableIDs. This stops us from having characters like "◎" in tableIDs
	 * which would undoubtedly break some URLs.
	 */
	asciiPrefix: string;
	name: string;
	description: string;
	playtype: Playtypes["bms"];
	url: string;
}

// I have no confidence in half of these links surviving.
// Eventually, some of these are going to disappear, and we'll have to find
// something else. probably.
export const BMS_TABLES: Array<BMSTableInfo> = [
	{
		name: "Insane",
		playtype: "7K",
		description: "The 7K GENOSIDE insane table.",
		url: "http://www.ribbit.xyz/bms/tables/insane_body.json",
		prefix: "★",
		asciiPrefix: "insane",
	},
	{
		name: "Normal",
		playtype: "7K",
		description: "The 7K GENOSIDE normal table.",
		url: "http://www.ribbit.xyz/bms/tables/normal_body.json",
		prefix: "☆",
		asciiPrefix: "normal",
	},
	{
		name: "Stella",
		playtype: "7K",
		description: "The stella table, from Stellaverse.",
		url: "https://stellabms.xyz/st/score.json",
		prefix: "st",
		asciiPrefix: "stella",
	},
	{
		name: "Satellite",
		playtype: "7K",
		description: "The satellite table, from Stellaverse.",
		url: "https://stellabms.xyz/sl/score.json",
		prefix: "sl",
		asciiPrefix: "satellite",
	},
	{
		name: "Insane2",
		playtype: "7K",
		description: "A successor to the original insane table, but is generally less consistent.",
		url: "https://rattoto10.github.io/second_table/insane_data.json",
		prefix: "▼",
		asciiPrefix: "insane2",
	},
	{
		name: "Normal2",
		playtype: "7K",
		description: "A successor to the original normal table.",
		url: "https://rattoto10.github.io/second_table/score.json",
		prefix: "▽",
		asciiPrefix: "normal2",
	},
	{
		name: "Overjoy",
		description: "The overjoy table. Level 1 is roughly equivalent to Insane 20.",
		playtype: "7K",
		url: "http://lr2.sakura.ne.jp/data/score.json",
		prefix: "★★",
		asciiPrefix: "overjoy",
	},
	{
		name: "DP Insane",
		description: "The 14K Insane table.",
		playtype: "14K",
		prefix: "★",
		asciiPrefix: "dpInsane",
		url: "http://dpbmsdelta.web.fc2.com/table/data/insane_data.json",
	},
	{
		name: "DP Normal",
		description: "The 14K Normal table, Sometimes called the delta table.",
		playtype: "14K",
		prefix: "δ",
		asciiPrefix: "dpNormal",
		url: "http://dpbmsdelta.web.fc2.com/table/data/dpdelta_data.json",
	},
	{
		name: "DP Satellite",
		description: "The 14K Satellite table.",
		playtype: "14K",
		prefix: "sl",
		asciiPrefix: "dpSatellite",
		url: "https://stellabms.xyz/dp/score.json",
	},
	{
		name: "Scratch 3rd",
		description: "The 7K Sara 3 table.",
		prefix: "h◎",
		asciiPrefix: "scratch",
		playtype: "7K",
		url: "http://minddnim.web.fc2.com/sara/3rd_hard/json/data.json",
	},
	{
		name: "LN",
		description: "The 7K LN table.",
		prefix: "◆",
		asciiPrefix: "ln",
		playtype: "7K",
		url: "http://flowermaster.web.fc2.com/lrnanido/gla/score.json",
	},
	{
		name: "Stardust",
		prefix: "ξ",
		asciiPrefix: "stardust",
		playtype: "7K",
		url: "https://mqppppp.neocities.org/StardustData.json",
		description: "The 7K Stardust table. This table covers ☆1 to ☆7.",
	},
	{
		name: "Starlight",
		prefix: "sr",
		asciiPrefix: "starlight",
		playtype: "7K",
		url: "https://djkuroakari.github.io/data.json",
		description: "The 7K Starlight table. This table covers ☆7 to ☆12.",
	},
	{
		name: "LN Overjoy",
		prefix: "◆◆",
		asciiPrefix: "lnOverjoy",
		playtype: "7K",
		url: "https://notepara.com/glassist/lnoj/body.json",
		description: "The 7K LN Overjoy table.",
	},
	{
		name: "Luminous",
		prefix: "lm",
		asciiPrefix: "luminous",
		playtype: "7K",
		url: "https://luminous-api.herokuapp.com/api/charts/accept",
		description: "The 7K Luminous Table. This is an alternative to the mainline LN tables.",
	},
];
