import db from "external/mongo/db";
import { integer, NotificationBody, NotificationDocument } from "tachi-common";
import { Random20Hex } from "utils/misc";

/**
 * Send a notification to a user.
 *
 * @param title - A human friendly title for this notification.
 * @param toUserID - The user to send the notification to.
 * @param body - The body of the notification.
 */
export async function SendNotification(title: string, toUserID: integer, body: NotificationBody) {
	const notification: NotificationDocument = {
		title,
		sentTo: toUserID,
		read: false,
		sentAt: Date.now(),
		notifID: `N${Random20Hex()}`,
		body,
	};

	await db.notifications.insert(notification);
}

/**
 * Mark a notification as read. This is notably different to deleting a notification,
 * and is typically done when the user acknowledges the existence of the notification.
 */
export function ReadNotification(notifID: string) {
	return db.notifications.update(
		{ notifID },
		{
			$set: { read: true },
		}
	);
}

export function DeleteNotification(notifID: string) {
	return db.notifications.remove({ notifID });
}
