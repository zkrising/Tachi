import { GetSessionFromParam, RequireOwnershipOfSession } from "./middleware";
import { Router } from "express";
import db from "external/mongo/db";
import { GetSessionScoreInfo } from "lib/score-import/framework/sessions/sessions";
import { p } from "prudence";
import { RequirePermissions } from "server/middleware/auth";
import prValidate from "server/middleware/prudence-validate";
import { GetGamePTConfig, GetScoreEnumConfs, GetScoreMetrics } from "tachi-common";
import { optNull } from "tachi-common/lib/schemas";
import { GetEnumDistForFolderAsOf } from "utils/folder";
import { AddToSetInRecord } from "utils/misc";
import { GetTachiData } from "utils/req-tachi-data";
import { GetUserWithID } from "utils/user";
import type { FolderDocument, ScoreDocument, integer } from "tachi-common";

const router: Router = Router({ mergeParams: true });

router.use(GetSessionFromParam);

/**
 * Retrieves the session, its scores and the related songs and charts.
 *
 * @name GET /api/v1/sessions/:sessionID
 */
router.get("/", async (req, res) => {
	const session = GetTachiData(req, "sessionDoc");

	const scores = await db.scores.find({
		scoreID: { $in: session.scoreIDs },
	});

	const [songs, charts, user, scoreInfo] = await Promise.all([
		db.anySongs[session.game].find({
			id: { $in: scores.map((e) => e.songID) },
		}),
		db.anyCharts[session.game].find({
			chartID: { $in: scores.map((e) => e.chartID) },
		}),
		GetUserWithID(session.userID),
		GetSessionScoreInfo(session),
	]);

	return res.status(200).json({
		success: true,
		description: `Successfully returned session ${session.name}.`,
		body: {
			session,
			songs,
			charts,
			scores,
			user,
			scoreInfo,
		},
	});
});

/**
 * Retrieves additional statistics about folder raises as a result of this session.
 *
 * More obviously, this endpoint returns stuff like "This session resulted in 4 more
 * hard clears on the Level 12 folder."
 *
 * This allows us to render pretty things in the UI, showing the user what their
 * best stats were.
 *
 * @warn This is probably the most complicated route in all of Tachi. Sorry about that.
 *
 * @name GET /api/v1/sessions/:sessionID/folder-raises
 */
router.get("/folder-raises", async (req, res) => {
	const session = GetTachiData(req, "sessionDoc");

	const gptConfig = GetGamePTConfig(session.game, session.playtype);

	const scoreInfo = await GetSessionScoreInfo(session);

	const enumRaises = [];

	for (const metric of GetScoreMetrics(gptConfig, "ENUM")) {
		enumRaises.push(
			...scoreInfo
				.filter((e) => !e.isNewScore && (e.deltas[metric] ?? -1) > 0)
				.map((e) => e.scoreID)
		);
	}

	// create lookup tables for a scoreID to its delta. We use this later to find out
	// what the "original" score's grade or lamp was prior to this raise.
	const enumDeltas: Record<string, Record<string, integer>> = {};

	for (const sci of scoreInfo) {
		if (sci.isNewScore) {
			continue;
		}

		enumDeltas[sci.scoreID] = sci.deltas;
	}

	const enumScoreMetrics = GetScoreEnumConfs(gptConfig);

	const relevantScores = await db.scores.find({
		scoreID: { $in: session.scoreIDs },
	});

	const chartIDs = relevantScores.map((e) => e.chartID);

	// what folderIDs were involved in this session?
	const affectedFolderIDs = (
		await db["folder-chart-lookup"].find(
			{
				chartID: { $in: chartIDs },
			},
			{
				projection: { folderID: 1 },
			}
		)
	).map((e) => e.folderID);

	// find all the active folder documents raised in this session.
	const folders = await db.folders.find({
		folderID: { $in: affectedFolderIDs },
		inactive: false,
	});

	const bestEnumMap = new Map<string, ScoreDocument>();

	for (const score of relevantScores) {
		for (const [metric, conf] of Object.entries(enumScoreMetrics)) {
			if (
				// @ts-expect-error lazy index cheating
				score.scoreData.enumIndexes[metric]! <
				conf.values.indexOf(conf.minimumRelevantValue)
			) {
				// isn't relevant
				continue;
			}

			const mapKey = `${score.chartID}-${metric}`;

			const existing = bestEnumMap.get(mapKey);

			if (!existing) {
				bestEnumMap.set(mapKey, score);
			} else if (
				// @ts-expect-error lazy index cheating
				score.scoreData.enumIndexes[metric] > existing.scoreData.enumIndexes[metric]
			) {
				bestEnumMap.set(mapKey, score);
			}
		}
	}

	const raiseInfo: Array<{
		folder: FolderDocument;
		raisedCharts: Array<string>; // Array<chartID>;
		previousCount: integer; // how many AAAs/HARD CLEARs/whatevers was on this
		// folder before this session?
		type: string;
		value: string;
		totalCharts: integer;
	}> = [];

	await Promise.all(
		folders.map(async (folder) => {
			// what was the grade and lamp distribution on this folder before the session?
			const { chartIDs, cumulativeEnumDist } = await GetEnumDistForFolderAsOf(
				session.userID,
				folder.folderID,
				session.timeStarted
			);

			// what is the distribution of raises on this folder?
			// NOTE: instead of storing an integer here
			// i.e. For the Level 12 folder:
			// AAA: 5 <- 5 new AAAs,
			// AA: 2 <- 2 new AAs, etc.
			// we store a Set of chartIDs instead, so
			// AAA: ["chart1","chart2", ...] with size 5.
			// This is so we can display *what* charts were raised in the UI.
			// This type results in looking like:
			//
			// {
			// 	grade: {
			// 		AAA: [chartID, chartID2],
			// 		AA: [chartID3]
			// 	},
			// 	lamp: {
			// 		"HARD CLEAR": [chartID2]
			// 	}
			// }

			for (const [metric, conf] of Object.entries(enumScoreMetrics)) {
				const metricDist: Record<string, Set<string>> = {};
				const previousDist = cumulativeEnumDist[metric]!;

				for (const chartID of chartIDs) {
					const bestEnumOnThisChart = bestEnumMap.get(`${chartID}-${metric}`);

					if (!bestEnumOnThisChart) {
						continue;
					}

					const gradeDeltaSc = scoreInfo.find(
						(s) => s.scoreID === bestEnumOnThisChart.scoreID
					);

					// if no grade delta exists then they raised from 0
					// @ts-expect-error silly cheaty enum access
					let gradeDelta = bestEnumOnThisChart.scoreData.enumIndexes[metric]!;

					if (
						gradeDeltaSc &&
						!gradeDeltaSc.isNewScore &&
						gradeDeltaSc.deltas[metric] !== undefined
					) {
						gradeDelta = gradeDeltaSc.deltas[metric]!;
					}

					// get all the enums this counts as a raise for.
					// that is to say: if you get an AAA, that also counts as a raise
					// for an AA, etc.

					// however, this should only extend down to whatever the previous
					// best enum on this chart was.
					// luckily, we can calculate this by checking what the grade is now
					// and taking away the delta. That gets us the original.
					// If this is less than the clearGradeIndex, use that instead.

					// note: we add one to this because .slice is inclusive,
					// so if we have a EX HARD CLEAR (i=7) with a raise of two,
					// minusing two will take us to CLEAR (i=5), and the
					// inclusivity will result in us
					// slicing ["CLEAR", "HARD CLEAR", "EX HARD CLEAR"]
					//          (i=5),    (i=6)          (i=7)
					// but this wasn't a new clear! this was only a new HARD CLEAR
					// and EX HARD CLEAR, so
					// we want ["HARD CLEAR", "EX HARD CLEAR"].
					const originalIndex =
						// @ts-expect-error silly cheaty enum access
						bestEnumOnThisChart.scoreData.enumIndexes[metric]! - gradeDelta + 1;

					// lowerbound the original grade at the minimum-relevant enum.
					const minimumGrade = Math.max(
						conf.values.indexOf(conf.minimumRelevantValue),
						originalIndex
					);

					for (const grade of conf.values.slice(
						minimumGrade,
						// @ts-expect-error silly cheaty enum access (2)
						// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
						bestEnumOnThisChart.scoreData.enumIndexes[metric]! + 1
					)) {
						AddToSetInRecord(grade, metricDist, chartID);
					}
				}

				for (const [enumVal, raisedCharts] of Object.entries(metricDist)) {
					raiseInfo.push({
						folder,

						previousCount: previousDist[enumVal] ?? 0,

						raisedCharts: Array.from(raisedCharts),
						type: metric,
						value: enumVal,
						totalCharts: chartIDs.length,
					});
				}
			}

			// now that we know what we've raised, and what was there at the start
			// we can push that.
		})
	);

	return res.status(200).json({
		success: true,
		description: `Retrieved folder raises.`,
		body: raiseInfo,
	});
});

interface ModifiableSessionProps {
	name?: string;
	desc?: string | null;
	highlight?: boolean;
}

/**
 * Modifies a session.
 *
 * Requires the requester to be the owner of the session, alongside having the
 * customise_session permission.
 *
 * @param name - A new name for the session.
 * @param desc - A new desc for the session.
 * @param highlight - Update the highlighted state of the session with this.
 *
 * @name PATCH /api/v1/sessions/:sessionID
 */
router.patch(
	"/",
	RequireOwnershipOfSession,
	RequirePermissions("customise_session"),
	prValidate(
		{
			name: p.optional(p.isBoundedString(3, 80)),
			desc: optNull(p.isBoundedString(3, 120)),
			highlight: "*boolean",
		},
		{},
		{ allowExcessKeys: true }
	),
	async (req, res) => {
		const session = GetTachiData(req, "sessionDoc");

		const updateExp: ModifiableSessionProps = {};

		const body = req.safeBody as {
			name?: string;
			desc?: string | null;
			highlight?: boolean;
		};

		if (body.name) {
			updateExp.name = body.name;
		}

		if (body.desc !== undefined) {
			updateExp.desc = body.desc;
		}

		if (typeof body.highlight === "boolean") {
			updateExp.highlight = body.highlight;
		}

		if (Object.keys(updateExp).length === 0) {
			return res.status(400).json({
				success: false,
				description: `This request modifies nothing about this session.`,
			});
		}

		const newSession = await db.sessions.findOneAndUpdate(
			{ sessionID: session.sessionID },
			{ $set: updateExp }
		);

		return res.status(200).json({
			success: true,
			description: `Updated Session.`,
			body: newSession,
		});
	}
);

export default router;
