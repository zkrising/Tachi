import { Router } from "express";
import db from "external/mongo/db";
import { GetSessionScoreInfo } from "lib/score-import/framework/sessions/sessions";
import { SearchSessions } from "lib/search/search";
import { GetGamePTConfig } from "tachi-common";
import { GetUGPT } from "utils/req-tachi-data";
import { CheckStrSessionAlg } from "utils/string-checks";
import type { SessionDocument, SessionScoreInfo, AnySessionRatingAlg } from "tachi-common";

const router: Router = Router({ mergeParams: true });

/**
 * Search a users sessions.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/sessions
 */
router.get("/", async (req, res) => {
	const { user, game, playtype } = GetUGPT(req);

	if (typeof req.query.search !== "string") {
		return res.status(400).json({
			success: false,
			description: `Invalid value for search parameter.`,
		});
	}

	const sessions = await SearchSessions(req.query.search, game, playtype, user.id, 100);

	return res.status(200).json({
		success: true,
		description: `Retrieved ${sessions.length} sessions.`,
		body: sessions,
	});
});

/**
 * Returns a user's best 100 sessions according to the default statistic
 * for that game.
 *
 * @param alg - An override to specify a different algorithm for that game.
 * @name GET /api/v1/users/:userID/games/:game/:playtype/sessions/best
 */
router.get("/best", async (req, res) => {
	const { user, game, playtype } = GetUGPT(req);

	const gptConfig = GetGamePTConfig(game, playtype);

	let alg = gptConfig.defaultSessionRatingAlg as AnySessionRatingAlg;

	if (typeof req.query.alg === "string") {
		const userAlg = CheckStrSessionAlg(game, playtype, req.query.alg);

		if (userAlg === null) {
			return res.status(400).json({
				success: false,
				description: `Invalid algorithm '${
					req.query.alg
				}' provided. Expected any of ${Object.keys(gptConfig.sessionRatingAlgs).join(
					", "
				)}.`,
			});
		}

		alg = userAlg;
	}

	const sessions = await db.sessions.find(
		{
			userID: user.id,
			game,
			playtype,
		},
		{
			limit: 100,
			sort: {
				[`calculatedData.${alg}`]: -1,
			},
		}
	);

	const sessionsWithScoreInfo: Array<SessionDocument & { __scoreInfo: Array<SessionScoreInfo> }> =
		[];

	await Promise.all(
		sessions.map((session) =>
			GetSessionScoreInfo(session).then((r) => {
				sessionsWithScoreInfo.push({
					...session,
					__scoreInfo: r,
				});
			})
		)
	);

	sessionsWithScoreInfo.sort(
		(a, b) => (b.calculatedData[alg] ?? -Infinity) - (a.calculatedData[alg] ?? -Infinity)
	);

	return res.status(200).json({
		success: true,
		description: `Retrieved ${sessions.length} sessions.`,
		body: sessionsWithScoreInfo,
	});
});

/**
 * Returns a users 100 most recent highlighted sessions. Returned in timeEnded order.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/sessions/highlighted
 */
router.get("/highlighted", async (req, res) => {
	const { user, game, playtype } = GetUGPT(req);

	const sessions = await db.sessions.find(
		{ userID: user.id, game, playtype, highlight: true },
		{ sort: { timeEnded: -1 }, limit: 100 }
	);

	const sessionsWithScoreInfo: Array<SessionDocument & { __scoreInfo: Array<SessionScoreInfo> }> =
		[];

	await Promise.all(
		sessions.map((session) =>
			GetSessionScoreInfo(session).then((r) => {
				sessionsWithScoreInfo.push({
					...session,
					__scoreInfo: r,
				});
			})
		)
	);

	return res.status(200).json({
		success: true,
		description: `Returned ${sessions.length} sessions.`,
		body: sessionsWithScoreInfo,
	});
});

/**
 * Returns a users 100 most recent sessions. Returned in timeEnded order.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/sessions/recent
 */
router.get("/recent", async (req, res) => {
	const { user, game, playtype } = GetUGPT(req);

	const sessions = await db.sessions.find(
		{ userID: user.id, game, playtype },
		{ sort: { timeEnded: -1 }, limit: 100 }
	);

	const sessionsWithScoreInfo: Array<SessionDocument & { __scoreInfo: Array<SessionScoreInfo> }> =
		[];

	await Promise.all(
		sessions.map((session) =>
			GetSessionScoreInfo(session).then((r) => {
				sessionsWithScoreInfo.push({
					...session,
					__scoreInfo: r,
				});
			})
		)
	);

	sessionsWithScoreInfo.sort((a, b) => b.timeEnded - a.timeEnded);

	return res.status(200).json({
		success: true,
		description: `Returned ${sessions.length} sessions.`,
		body: sessionsWithScoreInfo,
	});
});

/**
 * Returns a user's most recent session.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/sessions/last
 */
router.get("/last", async (req, res) => {
	const { user, game, playtype } = GetUGPT(req);

	const session = await db.sessions.findOne(
		{ userID: user.id, game, playtype },
		{ sort: { timeEnded: -1 } }
	);

	if (!session) {
		return res.status(404).json({
			success: false,
			description: `This user has not got any sessions!`,
		});
	}

	const scoreInfo = await GetSessionScoreInfo(session);

	return res.status(200).json({
		success: true,
		description: `Returned a session.`,
		body: {
			session,
			scoreInfo,
		},
	});
});

/**
 * Returns all sessions, but with unecessary properties removed so as to reduce
 * bandwidth. This is used for the calendar view in tachi-client, hence the name.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/sessions/calendar
 */
router.get("/calendar", async (req, res) => {
	const { user, game, playtype } = GetUGPT(req);

	const sessions = await db.sessions.find(
		{
			userID: user.id,
			game,
			playtype,
		},
		{
			projection: {
				sessionID: 1,
				name: 1,
				desc: 1,
				highlight: 1,
				timeStarted: 1,
				timeEnded: 1,
			},
		}
	);

	return res.status(200).json({
		success: true,
		description: `Found ${sessions.length} events.`,
		body: sessions,
	});
});

export default router;
