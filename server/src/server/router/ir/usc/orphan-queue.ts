import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { ServerConfig } from "lib/setup/config";
import { ChartDocument, integer, SongDocument } from "tachi-common";
import { GetNextCounterValue } from "utils/db";
import { Random20Hex } from "utils/misc";
import { USCClientChart } from "./types";

const logger = CreateLogCtx(__filename);

/**
 * Handles the orphan queue for USC charts. If the provided chart was just
 * unorphaned, returns the chart. Else, returns null.
 */
export async function HandleOrphanQueue(uscChartDoc: USCClientChart, userID: integer) {
	const chartName = `${uscChartDoc.artist} - ${uscChartDoc.title} (${IndexToDiff(
		uscChartDoc.difficulty
	)})`;

	logger.debug(`Recieved orphanqueue request for ${chartName}.`);

	const orphanChart = await db["usc-orphan-chart-queue"].findOne({
		"chartDoc.data.hashSHA1": uscChartDoc.chartHash,
	});

	if (!orphanChart) {
		logger.verbose(`Recieved unknown chart ${chartName}, orphaning.`);

		const { song, chart } = ConvertUSCChart(uscChartDoc);

		await db["usc-orphan-chart-queue"].insert({
			chartDoc: chart,
			songDoc: song,
			userIDs: [userID],
		});

		return null;
	}

	orphanChart.userIDs.push(userID);

	const uniqueUsersArr = [...new Set(orphanChart.userIDs)];

	const playcount = uniqueUsersArr.length;
	// If N or more people have played this chart while orphaned, unorphan
	// it.
	if (playcount >= ServerConfig.USC_QUEUE_SIZE) {
		logger.info(
			`Song ${chartName} was unorphaned by ${uniqueUsersArr.join(", ")} and ${userID}.`
		);
		const songID = await GetNextCounterValue("usc-song-id");

		logger.verbose(`${chartName} has been assigned songID ${songID}.`);

		const { songDoc, chartDoc } = orphanChart;

		songDoc.id = songID;
		chartDoc.songID = songID;

		await db.songs.usc.insert(songDoc);
		await db.charts.usc.insert(chartDoc);
		await db["usc-orphan-chart-queue"].remove({
			"chartDoc.data.hashSHA1": chartDoc.data.hashSHA1,
		});

		return chartDoc;
	}

	// otherwise, update the state of this orphan.

	logger.verbose(`UserID ${userID} played ${chartName}, which is now at ${playcount} plays.`);
	await db["usc-orphan-chart-queue"].update(
		{
			"chartDoc.data.hashSHA1": uscChartDoc.chartHash,
		},
		{
			$set: {
				userIDs: uniqueUsersArr,
			},
		}
	);

	return null;
}

function ConvertUSCChart(uscChartDoc: USCClientChart) {
	const chart: ChartDocument<"usc:Single"> = {
		chartID: Random20Hex(),
		difficulty: IndexToDiff(uscChartDoc.difficulty),
		isPrimary: true,
		level: "?",
		levelNum: 0,
		playtype: "Single",
		rgcID: null,
		songID: 0,
		versions: [],
		data: {
			hashSHA1: uscChartDoc.chartHash,
			isOfficial: false,
		},
	};

	const song: SongDocument<"usc"> = {
		title: uscChartDoc.title,
		artist: uscChartDoc.artist,
		firstVersion: null,
		id: 0,
		data: {},
		"alt-titles": [],
		"search-titles": [],
	};

	return { chart, song };
}

function IndexToDiff(index: 0 | 1 | 2 | 3): ChartDocument<"usc:Single">["difficulty"] {
	return (["NOV", "ADV", "EXH", "INF"] as const)[index];
}
