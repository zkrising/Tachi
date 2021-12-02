import fetch from "node-fetch";
import { XMLParser } from "fast-xml-parser";
import { BMSTableChart, BMSTablesDataset } from "./types";
import TableValueGetters from "./lookups";

const parser = new XMLParser();

export async function GetScoresForMD5(md5: string) {
	const scores = await fetch("https://dream-pro.info/~lavalse/LR2IR/2/getrankingxml.cgi", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: `songmd5=${md5}&id=1`,
	}).then((r) => r.text());

	const data = parser.parse(scores);

	return data;
}

export function Mean(d: number[]) {
	return d.reduce((a, r) => a + r, 0) / d.length;
}

export function GetSigmoidalValue(x: number) {
	if (x > 1) {
		return 1;
	}

	// https://math.stackexchange.com/a/2063195
	return 0.5 * (1 + Math.sin(x * Math.PI - Math.PI / 2));
}

export function GetBaseline(table: BMSTablesDataset, level: string) {
	// @ts-expect-error don't care it's exhaustive
	return TableValueGetters[table.name](level);
}

export function GetFString(table: BMSTablesDataset, chart: BMSTableChart) {
	return table.prefix + chart.level;
}
