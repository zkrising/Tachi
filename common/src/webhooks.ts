import type { GoalImportStat, integer, QuestImportStat } from "./types";
import type { Classes, Game, GPTString, Playtypes } from "./types/game-config";

/**
 * An event fired when a users class improves.
 */
export interface WebhookEventClassUpdateV1 {
	type: "class-update/v1";
	content: {
		userID: integer;
		set: Classes[GPTString];
		old: integer | null;
		new: integer;
		game: Game;
		playtype: Playtypes[Game];
	};
}

/**
 * An event fired when a goal is achieved.
 */
export interface WebhookEventGoalAchievedV1 {
	type: "goals-achieved/v1";
	content: {
		userID: integer;
		game: Game;
		goals: Array<{
			goalID: string;
			old: GoalImportStat;
			new: GoalImportStat;
			playtype: Playtypes[Game];
		}>;
	};
}

/**
 * An event fired when a quest is achieved.
 */
export interface WebhookEventQuestAchievedV1 {
	type: "quest-achieved/v1";
	content: {
		userID: integer;
		questID: string;
		old: QuestImportStat;
		new: QuestImportStat;
		game: Game;
		playtype: Playtypes[Game];
	};
}

/**
 * An event used for debugging. Contains information about the
 * registered client and the server.
 */
export interface WebhookEventStatusV1 {
	type: "status/v1";
	content: {
		clientName: string;
		clientID: string;
		serverVersion: string;
	};
}

export type WebhookEvents =
	| WebhookEventClassUpdateV1
	| WebhookEventGoalAchievedV1
	| WebhookEventQuestAchievedV1;
