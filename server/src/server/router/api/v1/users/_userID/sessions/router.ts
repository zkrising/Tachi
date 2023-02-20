import { Router } from "express";
import db from "external/mongo/db";
import { GetUser } from "utils/req-tachi-data";

const router: Router = Router({ mergeParams: true });

/**
 * Returns all sessions, FOR ALL GPTs
 * but with unecessary properties removed so as to reduce
 * bandwidth. This is used for the calendar view in tachi-client, hence the name.
 *
 * @name GET /api/v1/users/:userID/sessions/calendar
 */
router.get("/calendar", async (req, res) => {
	const user = GetUser(req);

	const sessions = await db.sessions.find(
		{ userID: user.id },
		{
			projection: {
				sessionID: 1,
				name: 1,
				desc: 1,
				highlight: 1,
				timeStarted: 1,
				timeEnded: 1,
				game: 1,
				playtype: 1,
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
