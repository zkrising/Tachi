import { Router } from "express";
import db from "../../../../../../external/mongo/db";
import { SYMBOL_TachiData } from "../../../../../../lib/constants/tachi";
import { RequirePermissions } from "../../../../../middleware/auth";
import prValidate from "../../../../../middleware/prudence-validate";
import p from "prudence";
import { RequireOwnershipOfSession } from "./middleware";

const router: Router = Router({ mergeParams: true });

/**
 * Retrieves the session, its scores and the related songs and charts.
 *
 * @name GET /api/v1/sessions/:sessionID
 */
router.get("/", async (req, res) => {
	const session = req[SYMBOL_TachiData]!.sessionDoc!;

	const scores = await db.scores.find({
		scoreID: { $in: session.scoreInfo.map((e) => e.scoreID) },
	});

	const [songs, charts] = await Promise.all([
		db.songs[session.game].find({
			id: { $in: scores.map((e) => e.songID) },
		}),
		db.charts[session.game].find({
			chartID: { $in: scores.map((e) => e.chartID) },
		}),
	]);

	return res.status(200).json({
		success: true,
		description: `Successfully returned session ${session.name}.`,
		body: {
			session,
			songs,
			charts,
			scores,
		},
	});
});

interface ModifiableSessionProps {
	name?: string;
	desc?: string;
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
			desc: p.optional(p.isBoundedString(3, 120)),
			highlight: "*boolean",
		},
		{},
		{ allowExcessKeys: true }
	),
	async (req, res) => {
		const session = req[SYMBOL_TachiData]!.sessionDoc!;

		const updateExp: ModifiableSessionProps = {};

		if (req.body.name) {
			updateExp.name = req.body.name as string;
		}

		if (req.query.desc) {
			updateExp.desc = req.body.desc as string;
		}

		if (typeof req.body.highlight === "boolean") {
			updateExp.highlight = req.body.highlight as boolean;
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
