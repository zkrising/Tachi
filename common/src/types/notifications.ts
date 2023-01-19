import type { integer, Game, Playtype } from "../types";

export interface BaseNotification {
	title: string;
	notifID: string;

	// The user this notification was sent to.
	sentTo: integer;
	sentAt: integer;
	read: boolean;
}

export type NotificationBody =
	| {
			type: "QUEST_CHANGED"; // Emitted when a quest the user is subscribed to changed.
			content: {
				questID: string;
				game: Game;
				playtype: Playtype;
			};
	  }
	| {
			type: "RIVALED_BY"; // Emitted when the user is rivalled by someone.
			content: {
				userID: integer;
				game: Game;
				playtype: Playtype;
			};
	  }
	| {
			type: "SITE_ANNOUNCEMENT"; // Emitted as a site announcement
			// eslint-disable-next-line @typescript-eslint/ban-types
			content: {};
	  };
