import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { PoyashiBPI } from "rg-stats";
import type { integer, ChartDocument, Playtypes } from "tachi-common";

const logger = CreateLogCtx(__filename);

interface PlaylistEntry {
	entry_id: integer;
	difficulty: "another" | "beginner" | "hyper" | "leggendaria" | "normal";
	bar_style?: "event" | "lightning" | "rainbow";
}

export interface IIDXPlaylist {
	name: string;
	play_style: "DP" | "SP";
	charts: Array<PlaylistEntry>;
}

export type TachiIIDXPlaylist = {
	playtype: Playtypes["iidx"] | null; // What playtype is this for? If null, this playlist is for any.

	urlName: string; // what should we call this playlist in the url?
	playlistName: string; // what should this playlist be called in-game?
	description: string;
} & (
	| {
			forSpecificUser: true; // playlist is user dependent.
			// like, say, their rivals scores or something.
			// then the callbacks need to recieve that info.
			getPlaylists: (
				userID: integer,
				playtype: Playtypes["iidx"]
			) => Promise<Array<IIDXPlaylist>>;
	  }
	| {
			forSpecificUser?: false;
			getPlaylists: (playtype: Playtypes["iidx"]) => Promise<Array<IIDXPlaylist>>;
	  }
);

function ChartsToPlaylistFormat(
	charts: Array<ChartDocument<"iidx:DP" | "iidx:SP">>
): Array<PlaylistEntry> {
	const arr: Array<PlaylistEntry> = [];

	for (const chart of charts) {
		let inGameID: number;

		// welp. pick the latest one.

		if (Array.isArray(chart.data.inGameID)) {
			const el = chart.data.inGameID.at(-1);

			if (el === undefined) {
				// wut, chart has an empty array of ingameids?
				logger.warn(`Chart '${chart.chartID}' has an empty array of inGameIDs.`);
				continue;
			}

			inGameID = el;
		} else {
			inGameID = chart.data.inGameID;
		}

		// skip 2dxtra, this excludes things like "All Scratch ANOTHER".
		if (chart.data["2dxtraSet"] !== null) {
			continue;
		}

		let barStyle: "event" | undefined;

		// highlight individual difference charts as "event".
		if (
			chart.playtype === "SP" &&
			(chart as ChartDocument<"iidx:SP">).data.hcTier?.individualDifference
		) {
			barStyle = "event";
		} else if (
			chart.playtype === "DP" &&
			(chart as ChartDocument<"iidx:DP">).data.dpTier?.individualDifference
		) {
			barStyle = "event";
		}

		arr.push({
			entry_id: inGameID,

			// @ts-expect-error yeah, i know. it'll be fine.
			difficulty: chart.difficulty.toLowerCase(),

			bar_style: barStyle,
		});
	}

	return arr;
}

export const CUSTOM_TACHI_IIDX_PLAYLISTS: Array<TachiIIDXPlaylist> = [
	{
		urlName: "aaa-bpi",
		playtype: null,
		description: "Folders for how much an AAA is worth in BPI.",
		playlistName: "AAA BPIs",
		async getPlaylists(playtype) {
			const cutoffs = [-10, -5, 0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

			const bounds: Array<[number, number]> = [];

			for (let i = 0; i < cutoffs.length - 1; i++) {
				bounds.push([cutoffs[i], cutoffs[i + 1]] as [number, number]);
			}

			const charts = (await db.charts.iidx.find({
				"data.kaidenAverage": { $ne: null },
				playtype,
			})) as Array<ChartDocument<"iidx:DP" | "iidx:SP">>;

			const entries = [];

			for (const chart of charts) {
				// what's the least EX Score you can have for an AAA on this chart?
				const AAA_EX = Math.ceil(chart.data.notecount * 2 * (8 / 9));

				entries.push({
					chart,
					bpi: PoyashiBPI.calculate(
						AAA_EX,
						chart.data.kaidenAverage!,
						chart.data.worldRecord!,
						chart.data.notecount * 2,
						chart.data.bpiCoefficient
					),
				});
			}

			const playlists: Array<IIDXPlaylist> = [];

			for (const [lower, upper] of bounds) {
				playlists.push({
					name: `AAA BPI ${lower}~${upper}`,
					play_style: playtype,
					charts: ChartsToPlaylistFormat(
						entries.filter((e) => e.bpi <= upper && e.bpi > lower).map((e) => e.chart)
					),
				});
			}

			return playlists;
		},
	},
];
