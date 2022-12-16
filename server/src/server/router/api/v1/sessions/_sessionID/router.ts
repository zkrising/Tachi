import {
	GetSessionFromParam,
	RequireOwnershipOfSession,
	UpdateSessionViewcount,
} from "./middleware";
import { Router } from "express";
import db from "external/mongo/db";
import p from "prudence";
import { RequirePermissions } from "server/middleware/auth";
import prValidate from "server/middleware/prudence-validate";
import { GetGamePTConfig } from "tachi-common";
import { GetGradeLampDistributionForFolderAsOf } from "utils/folder";
import { AddToSetInRecord } from "utils/misc";
import { optNull } from "utils/prudence";
import { GetTachiData } from "utils/req-tachi-data";
import { GetUserWithID } from "utils/user";
import type {
	ScoreDocument,
	Grades,
	IDStrings,
	FolderDocument,
	Lamps,
	integer,
} from "tachi-common";

const router: Router = Router({ mergeParams: true });

router.use(GetSessionFromParam);

/**
 * Retrieves the session, its scores and the related songs and charts.
 *
 * @name GET /api/v1/sessions/:sessionID
 */
router.get("/", UpdateSessionViewcount, async (req, res) => {
	const session = GetTachiData(req, "sessionDoc");

	const scores = await db.scores.find({
		scoreID: { $in: session.scoreInfo.map((e) => e.scoreID) },
	});

	const [songs, charts, user] = await Promise.all([
		db.songs[session.game].find({
			id: { $in: scores.map((e) => e.songID) },
		}),
		db.charts[session.game].find({
			chartID: { $in: scores.map((e) => e.chartID) },
		}),
		GetUserWithID(session.userID),
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

	const { clearLamp, clearGrade } = gptConfig;

	// nobody cares about raises on folders below these grades. For IIDX, this is
	// EASY CLEAR and A grade. For more info, see common/src/config.ts
	const clearLampIndex = gptConfig.lamps.indexOf(clearLamp);
	const clearGradeIndex = gptConfig.grades.indexOf(clearGrade);

	// things that are definitely raises
	const newScoreIDs = session.scoreInfo.filter((e) => e.isNewScore).map((e) => e.scoreID);
	const gradeRaiseIDs = session.scoreInfo
		.filter((e) => !e.isNewScore && e.gradeDelta > 0)
		.map((e) => e.scoreID);
	const lampRaiseIDs = session.scoreInfo
		.filter((e) => !e.isNewScore && e.lampDelta > 0)
		.map((e) => e.scoreID);

	// create lookup tables for a scoreID to its delta. We use this later to find out
	// what the "original" score's grade or lamp was prior to this raise.
	const gradeDeltas: Record<string, integer> = {};
	const lampDeltas: Record<string, integer> = {};

	for (const scoreInfo of session.scoreInfo) {
		if (scoreInfo.isNewScore) {
			continue;
		}

		if (scoreInfo.gradeDelta > 0) {
			gradeDeltas[scoreInfo.scoreID] = scoreInfo.gradeDelta;
		}

		if (scoreInfo.lampDelta > 0) {
			lampDeltas[scoreInfo.scoreID] = scoreInfo.lampDelta;
		}
	}

	// find all the new scores that were better than our minimum grade/lamps
	const newRaises = await db.scores.find({
		scoreID: { $in: newScoreIDs },
		$or: [
			{ "scoreData.gradeIndex": { $gte: clearGradeIndex } },
			{ "scoreData.lampIndex": { $gte: clearLampIndex } },
		],
	});

	const gradeRaises = await db.scores.find({
		scoreID: { $in: gradeRaiseIDs },
		"scoreData.gradeIndex": { $gte: clearGradeIndex },
	});

	const lampRaises = await db.scores.find({
		scoreID: { $in: lampRaiseIDs },
		"scoreData.lampIndex": { $gte: clearLampIndex },
	});

	const allRaises = [...newRaises, ...gradeRaises, ...lampRaises];

	const chartIDs = allRaises.map((e) => e.chartID);

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

	// create a map of chartID -> grade. The grade in question represents
	// the best grade achieved on that chart in this session.
	// this is necessary to - say - handle a case where a user plays a chart
	// and gets a B, then plays it again and gets an A.
	const gradeRaiseMap = new Map<string, ScoreDocument>();

	// new scores may also be grade raises
	for (const score of [...gradeRaises, ...newRaises]) {
		// skip things that aren't good enough
		if (score.scoreData.gradeIndex < clearGradeIndex) {
			continue;
		}

		const exists = gradeRaiseMap.get(score.chartID);

		if (exists) {
			if (exists.scoreData.gradeIndex < score.scoreData.gradeIndex) {
				// this one is more important
				gradeRaiseMap.set(score.chartID, score);
			}
		} else {
			gradeRaiseMap.set(score.chartID, score);
		}
	}

	// same as above, but for lamps
	const lampRaiseMap = new Map<string, ScoreDocument>();

	for (const score of [...lampRaises, ...newRaises]) {
		// skip things that aren't good enough
		if (score.scoreData.lampIndex < clearLampIndex) {
			continue;
		}

		const exists = lampRaiseMap.get(score.chartID);

		if (exists) {
			if (exists.scoreData.lampIndex < score.scoreData.lampIndex) {
				// this one is more important
				lampRaiseMap.set(score.chartID, score);
			}
		} else {
			lampRaiseMap.set(score.chartID, score);
		}
	}

	const raiseInfo: Array<{
		folder: FolderDocument;
		raisedCharts: Array<string>; // Array<chartID>;
		previousCount: integer; // how many AAAs/HARD CLEARs/whatevers was on this
		// folder before this session?
		type: "grade" | "lamp";
		value: Grades[IDStrings] | Lamps[IDStrings]; // this type is technically
		// incorrect but who cares
		totalCharts: integer;
	}> = [];

	await Promise.all(
		folders.map(async (folder) => {
			// what was the grade and lamp distribution on this folder before the session?
			const { chartIDs, gradeDist, lampDist } = await GetGradeLampDistributionForFolderAsOf(
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
			const raiseGradeDist: Partial<Record<Grades[IDStrings], Set<string>>> = {};
			const raiseLampDist: Partial<Record<Lamps[IDStrings], Set<string>>> = {};

			// for all charts in this folder
			for (const chartID of chartIDs) {
				const gradeRaise = gradeRaiseMap.get(chartID);
				const lampRaise = lampRaiseMap.get(chartID);

				if (gradeRaise) {
					// get all the grades this counts as a raise for.
					// that is to say: if you get an AAA, that also counts as a raise
					// for an AA, etc.

					// however, this should only extend down to whatever the previous
					// best lamp on this chart was.
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
					const originalGradeIndex =
						gradeRaise.scoreData.gradeIndex -
						(gradeDeltas[gradeRaise.scoreID] ?? Infinity) +
						1;

					// lowerbound the original grade at the minimum-relevant grade
					// for this game.
					const minimumGrade = Math.max(clearGradeIndex, originalGradeIndex);

					for (const grade of gptConfig.grades.slice(
						minimumGrade,
						gradeRaise.scoreData.gradeIndex + 1
					)) {
						AddToSetInRecord(grade, raiseGradeDist, gradeRaise.chartID);
					}
				}

				if (lampRaise) {
					// see previous gradeRaise handler for explanation
					const originalLampIndex =
						lampRaise.scoreData.lampIndex -
						(lampDeltas[lampRaise.scoreID] ?? Infinity) +
						1;

					const minimumLamp = Math.max(clearLampIndex, originalLampIndex);

					for (const lamp of gptConfig.lamps.slice(
						minimumLamp,
						lampRaise.scoreData.lampIndex + 1
					)) {
						AddToSetInRecord(lamp, raiseLampDist, lampRaise.chartID);
					}
				}
			}

			// now that we know what we've raised, and what was there at the start
			// we can push that.

			for (const [grade, raisedCharts] of Object.entries(raiseGradeDist)) {
				raiseInfo.push({
					folder,

					// @ts-expect-error this is definitely a valid retrieval. be quiet.
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					previousCount: gradeDist[grade] ?? 0,

					raisedCharts: Array.from(raisedCharts),
					type: "grade",
					value: grade as Grades[IDStrings],
					totalCharts: chartIDs.length,
				});
			}

			for (const [lamp, raisedCharts] of Object.entries(raiseLampDist)) {
				raiseInfo.push({
					folder,

					// @ts-expect-error this is definitely a valid retrieval. be quiet.
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					previousCount: lampDist[lamp] ?? 0,

					raisedCharts: Array.from(raisedCharts),
					type: "lamp",
					value: lamp as Lamps[IDStrings],
					totalCharts: chartIDs.length,
				});
			}
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
