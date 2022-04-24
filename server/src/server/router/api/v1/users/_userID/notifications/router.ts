import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { RequireSelfRequestFromUser } from "../middleware";

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
	const user = req[SYMBOL_TachiData]!.requestedUser!;

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
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	const updateRes = await db.notifications.update(
		{
			sentTo: user.id,
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
 * Delete a notification from your inbox.
 *
 * @name DELETE /api/v1/users/:userID/notifications/:notifID
 */
router.delete("/:notifID", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	const isTheirNotif = await db.notifications.findOne({
		sentTo: user.id,
		notifID: req.params.notifID,
	});

	if (!isTheirNotif) {
		return res.status(404).json({
			success: false,
			description: `This notification does not exist, is not yours, or was already deleted.`,
		});
	}

	return res.status(200).json({
		success: true,
		description: `Deleted notification.`,
		body: isTheirNotif,
	});
});

export default router;
