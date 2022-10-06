// Charts that had their notecounts changed as the result of a recent discovered

import db from "external/mongo/db";
import { GenericGetGradeAndPercent } from "lib/score-import/framework/common/score-utils";
import UpdateScore from "lib/score-mutation/update-score";
import { GetGamePTConfig } from "tachi-common";
import type { ScoreDocument, ChartDocument } from "tachi-common";
import type { Migration } from "utils/types";

// bug in the seeds.
const recalcChartIDs = [
	"38ebf85a6b9079bed6acb418cc3866f3a6b6adb7",
	"88a5f281abf7ce08fde62769edb50b2ed8a1eeb9",
	"cd89731d004cdcc5292aa10d11c181d8d0545aa5",
	"8520f95da6f51548adde23ce84bf800e4a19334b",
	"fcb31b1536d97bfb213cc574462d68d40f9fb15e",
	"bd67cde14867804902f526c61df59982cb4ffa3e",
	"241d190af5648d98a91f3b37585d648020d272ff",
	"7275b7c88df34b6401fb99da7dece2af785cfc4f",
	"ce71f9c794c429b71ca37ca0615b7b983b3d16ef",
	"13d6019c21f8fd53b141000c742d4d2a37616aea",
	"e00c3264172f717675e9c4c2d4ee82f2540a6772",
	"76b502d2d39861095dc10f691d214bd9f482a815",
	"4ad68e155dae973d737d7d8ac57453abcc4ac035",
	"8e60d1ad926add5e84fb6de5a0924c89c365f80f",
	"a73460d18cf2c6d13a09a46e83073fbd989d2222",
	"21a475985581c40b616fdfb8ee60d16f64c9bbfa",
	"a0687bc6951293e803bc121526948dc49aa1394f",
	"2a80757be4c72f3674c96ff4bdff75deea120892",
	"37817b02053862c7887f8e30cda23cd5f2c3be4d",
	"df5543a6822c307dfdbdf162fecf6da013043fff",
	"828dc62f7cabaf33db72158fdfc5c9ffb89adb4e",
	"7e7e6866fc5c587a8029aa1bf0bec56441c8c519",
	"8a51375d59bbe382f9e951d69a8f814b359b570b",
	"8ce008ee846349caba96edd4538e7a9c148f8af7",
	"c8805a4e481bb124b6687c44d3d359bdca4dd50e",
	"adc8458064d179fef6302c12d691f9ff58d92163",
	"f654276295ca8c228da91c230cc8ac86b23d16e9",
	"1a856ae72278eedc5ac19050bc1cb441885ac46d",
	"d87e7aba6edf70bd4b0087165afaa82fad801db3",
	"85a4e8cebef9a12dddb407ff581f499a078f6010",
];

const migration: Migration = {
	id: "recalc-broken-iidx-notecounts",
	up: async () => {
		await Promise.all(recalcChartIDs.map((e) => HandleChangedIIDXNotecount(e)));
	},
	down: () => {
		throw new Error(`Reverting this change is not possible.`);
	},
};

async function HandleChangedIIDXNotecount(chartID: string) {
	const scores = await db.scores.find({ chartID });
	const chart = await db.charts.iidx.findOne({ chartID });

	if (!chart) {
		throw new Error(`No such chart with the ID ${chartID} exists.`);
	}

	return Promise.all(scores.map((e) => RecalcPercentForIIDXScore(e, chart)));
}

function RecalcPercentForIIDXScore(score: ScoreDocument, chart: ChartDocument) {
	const { percent, grade } = GenericGetGradeAndPercent("iidx", score.scoreData.score, chart);

	const gptConfig = GetGamePTConfig("iidx", score.playtype);

	const gradeIndex = gptConfig.grades.indexOf(grade);

	// shouldn't happen, but lets check anyway.
	if (gradeIndex === -1) {
		throw new Error(
			`Failed to calculate new grade? ${percent} ${grade} on chartID:${chart.chartID}.`
		);
	}

	const newScore: ScoreDocument = {
		...score,
		scoreData: {
			...score.scoreData,
			percent,
			grade,
			gradeIndex,
		},
	};

	return UpdateScore(score, newScore);
}

export default migration;
