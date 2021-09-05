/* eslint-disable @typescript-eslint/no-explicit-any */
import { integer, SessionDocument, SessionScoreInfo } from "tachi-common";
import db from "external/mongo/db";
import MigrateRecords from "./migrate";
import { CreateSessionID } from "lib/score-import/framework/sessions/sessions";
import { oldKTDB } from "./old-db";
import CreateLogCtx from "lib/logger/logger";
import { allSupportedGames } from "tachi-common/js/config/static-config";

const logger = CreateLogCtx(__filename);

interface LegacySessionScoreFormat {
	pbInfo: {
		isGeneralPB: boolean;
		isGradePB: boolean;
		isLampPB: boolean;
		isNewScore: boolean;
		lampDelta: integer;
		percentDelta: number;
		gradeDelta: integer;
		scoreDelta: number;
	};
	scoreID: string;
}

async function ConvertScoreToScoreInfo(
	score: LegacySessionScoreFormat
): Promise<SessionScoreInfo | null> {
	const scoreIDs = await oldKTDB.get("score-id-lookup").findOne({
		old: score.scoreID,
	});

	if (!scoreIDs) {
		logger.warn(`No score for ${score.scoreID}? Skipping.`);
		return null;
	}

	logger.verbose(`Found score for ${score.scoreID}.`);

	if (score.pbInfo.isNewScore) {
		return {
			isNewScore: true,
			scoreID: scoreIDs.new,
		};
	}

	return {
		scoreID: scoreIDs.new,
		isNewScore: false,
		gradeDelta: score.pbInfo.gradeDelta,
		lampDelta: score.pbInfo.lampDelta,
		percentDelta: score.pbInfo.percentDelta,
		scoreDelta: score.pbInfo.scoreDelta,
	};
}

async function ConvertFn(c: any): Promise<SessionDocument | null> {
	if (!allSupportedGames.includes(c.game)) {
		return null;
	}

	const scores = [];

	for (const sc of c.scores) {
		// eslint-disable-next-line no-await-in-loop
		const conv = await ConvertScoreToScoreInfo(sc);

		if (conv === null) {
			continue;
		}

		scores.push(conv);
	}

	const sessionDocument: SessionDocument = {
		name: c.name,
		desc: c.desc,
		timeStarted: c.timeStarted,
		timeEnded: c.timeEnded,
		timeInserted: c.timestamp,
		game: c.game,
		playtype: c.playtype,
		highlight: !!c.highlight,
		sessionID: CreateSessionID(),
		views: 0,
		userID: c.userID,
		calculatedData: {},
		scoreInfo: scores,
		importType: null,
	};

	return sessionDocument;
}

(async () => {
	await MigrateRecords(db.sessions, "sessions", ConvertFn, {}, true);

	process.exit(0);
})();
