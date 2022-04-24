import db from "external/mongo/db";
import { FormatGame, Game, integer, Playtype, PublicUserDocument } from "tachi-common";
import { SendNotification } from "./notifications";

/**
 * A utility wrapper for sending the SET_RIVAL notification.
 *
 * @param toUserID - The user to send this notification to.
 * @param fromUser - The user who rivalled them.
 * @param game - The game they rivalled them on.
 * @param playtype - The playtype they rivalled them on.
 */
export async function SendSetRivalNotification(
	toUserID: integer,
	fromUser: PublicUserDocument,
	game: Game,
	playtype: Playtype
) {
	const alreadyBeenPinged = await db.notifications.findOne({
		sentTo: toUserID,
		"body.type": "RIVALED_BY",
		"body.content": {
			userID: fromUser.id,
			game,
			playtype,
		},
	});

	if (alreadyBeenPinged) {
		return;
	}

	return SendNotification(
		`${fromUser.username} just added you as a rival for ${FormatGame(game, playtype)}`,
		toUserID,
		{
			type: "RIVALED_BY",
			content: {
				userID: fromUser.id,
				game,
				playtype,
			},
		}
	);
}
