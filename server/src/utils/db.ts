import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
const logger = CreateLogCtx(__filename);
import { integer, Game, ScoreDocument, PBScoreDocument } from "tachi-common";

export async function GetNextCounterValue(counterName: string): Promise<integer> {
	const sequenceDoc = await db.counters.findOneAndUpdate(
		{
			counterName,
		},
		{
			$inc: {
				value: 1,
			},
		},
		{
			// this is marked as deprecated, but it shouldn't be, as returnDocument: "before"
			// does nothing.
			returnOriginal: true,
		}
	);

	if (!sequenceDoc) {
		logger.error(`Could not find sequence document for ${counterName}`);
		throw new Error(`Could not find sequence document for ${counterName}.`);
	}

	return sequenceDoc.value;
}

export async function DecrementCounterValue(counterName: string): Promise<integer> {
	logger.verbose(`Decrementing Counter Value ${counterName}.`);

	const sequenceDoc = await db.counters.findOneAndUpdate(
		{
			counterName,
		},
		{
			$inc: {
				value: -1,
			},
		},
		{
			returnOriginal: false,
		}
	);

	if (!sequenceDoc) {
		logger.error(`Could not find sequence document for ${counterName}`);
		throw new Error(`Could not find sequence document for ${counterName}.`);
	}

	return sequenceDoc.value;
}

export async function GetRelevantSongsAndCharts(
	scores: (ScoreDocument | PBScoreDocument)[],
	game: Game
) {
	const [songs, charts] = await Promise.all([
		db.songs[game].find({
			id: { $in: scores.map((e) => e.songID) },
		}),
		db.charts[game].find({
			chartID: { $in: scores.map((e) => e.chartID) },
		}),
	]);

	return { songs, charts };
}
