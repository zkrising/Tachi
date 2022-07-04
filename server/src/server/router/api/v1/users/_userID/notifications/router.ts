import { RequireSelfRequestFromUser } from "../middleware";
import { Router } from "express";
import db from "external/mongo/db";
import { ONE_SECOND } from "lib/constants/time";
import { GetTachiData } from "utils/req-tachi-data";

const router: Router = Router({ mergeParams: true });

// Notifications aren't really for anyone else to interact with. Only the requesting user
// should be able to see their notifications.
router.use(RequireSelfRequestFromUser);

/**
 * Return all of this user's notifications, this is sorted on most recently sent first.
 *
 * @name GET /api/v1/users/:userID/notifications
 */
router.get("/", async (req, res) => {
	const user = GetTachiData(req, "requestedUser");

	const notifs = await db.notifications.find(
		{
			sentTo: user.id,
		},
		{
			sort: {
				sentAt: -1,
			},
		}
	);

	return res.status(200).json({
		success: true,
		description: `Found ${notifs.length} notifications.`,
		body: notifs,
	});
});

/**
 * Mark all notifications in this user's inbox as read.
 *
 * @name POST /api/v1/users/:userID/notifications/mark-all-read
 */
router.post("/mark-all-read", async (req, res) => {
	const user = GetTachiData(req, "requestedUser");

	const updateRes = await db.notifications.update(
		{
			sentTo: user.id,

			// insanely rare edge case, but if someone submits an empty-my-inbox
			// request, and then gets a notif at the same time, they run the risk of
			// emptying something so immediately they don't actually ever see it.
			// This hack mitigates that, slightly.
			sentAt: {
				$lt: Date.now() - ONE_SECOND * 2,
			},
		},
		{
			$set: { read: true },
		},
		{
			multi: true,
		}
	);

	return res.status(200).json({
		success: true,
		description: `Marked ${updateRes.n} notifications as read.`,
		body: {},
	});
});

/**
 * Clear all notifications from your inbox.
 *
 * @name POST /api/v1/users/:userID/notifications/delete-all
 */
router.post("/delete-all", async (req, res) => {
	const user = GetTachiData(req, "requestedUser");

	const deleted = await db.notifications.remove({
		sentTo: user.id,

		// See mark-all-read for an explanation of this behaviour.
		sentAt: {
			$lt: Date.now() - ONE_SECOND * 2,
		},
	});

	return res.status(200).json({
		success: true,
		description: `Deleted ${deleted.deletedCount ?? 0} notification(s).`,
		body: {},
	});
});

export default router;
