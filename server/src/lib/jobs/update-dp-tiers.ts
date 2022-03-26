/* eslint-disable no-await-in-loop */
import fetch from "utils/fetch";
import { parse } from "node-html-parser";
import CreateLogCtx from "lib/logger/logger";
import { FindSongOnTitle } from "utils/queries/songs";
import db from "external/mongo/db";
import { RecalcAllScores } from "utils/calculations/recalc-scores";
import { decode } from "html-entities";

const logger = CreateLogCtx(__filename);

async function UpdateDPTiers() {
	const rawHTML = await fetch("https://zasa.sakura.ne.jp/dp/run.php").then((r) => r.text());

	// time for some fun html parsing.

	const data = parse(rawHTML);

	const rows = data.querySelectorAll("tr");

	const parsedData = [];

	for (const row of rows) {
		// We only care about rows with 4 children.
		// that's because the data is formatted like
		// [HYPER, ANOTHER, LEGGENDARIA, SONG_TITLE]
		// but has interspersed headers for game versions.
		if (row.childNodes.length !== 4) {
			continue;
		}

		parsedData.push({
			HYPER: ParseTierStr(row.childNodes[0].innerText),
			ANOTHER: ParseTierStr(row.childNodes[1].innerText),
			LEGGENDARIA: ParseTierStr(row.childNodes[2].innerText),
			songTitle: decode(row.childNodes[3].innerText),
		});
	}

	logger.info(`Got DP tier data. Applying it.`);

	const updatedSongIDs = new Set();

	await Promise.all(
		parsedData.map(async (d) => {
			const song = await FindSongOnTitle("iidx", d.songTitle);

			if (!song) {
				logger.warn(`Couldn't find song with title ${d.songTitle}.`);
				return;
			}

			for (const difficulty of ["HYPER", "ANOTHER", "LEGGENDARIA"] as const) {
				if (d[difficulty] === null) {
					continue;
				}

				const result = await db.charts.iidx.update(
					{
						versions: "29",
						playtype: "DP",
						songID: song.id,
						difficulty,
					},
					{
						$set: {
							"tierlistInfo.dp-tier": {
								text: d[difficulty]!.toString(),
								value: d[difficulty]!,
							},
						},
					}
				);

				if (result.nModified) {
					updatedSongIDs.add(song.id);
				}
			}
		})
	);

	if (updatedSongIDs.size !== 0) {
		logger.info(
			`${updatedSongIDs.size} songs were changed. Recalcing the relevant scores now.`
		);

		await RecalcAllScores({
			game: "iidx",
			playtype: "DP",
			songID: { $in: [...updatedSongIDs.values()] },
		});

		logger.info(`Recalced those scores.`);
	}

	logger.info("Done.");
}

/**
 * Parses a formatted string on the zasa website into a number. Returns null
 * if the string is "-", which indicates nothing is present.
 */
function ParseTierStr(tierStr: string) {
	if (tierStr === "-") {
		return null;
	}

	const result = tierStr.match(/\((.*)\)$/u);

	if (result && result[1]) {
		return Number(result[1]);
	}

	throw new Error(`Can't parse tierStr ${tierStr}.`);
}

if (require.main === module) {
	UpdateDPTiers().then(() => {
		process.exit(0);
	});
}
