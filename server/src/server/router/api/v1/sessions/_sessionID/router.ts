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
import { optNull } from "utils/prudence";
import { GetTachiData } from "utils/req-tachi-data";
import { GetUserWithID } from "utils/user";

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
