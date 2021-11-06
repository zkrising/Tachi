import { Game, Playtypes } from ".";
import { GameClassSets } from "./game-classes";
import { GoalImportStat, IDStrings, integer, MilestoneImportStat } from "./types";

/**
 * An event fired when a users class improves.
 */
export interface WebhookEventClassUpdateV1 {
	type: "class-update/v1";
	content: {
		userID: integer;
		set: GameClassSets[IDStrings];
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
	type: "goal-achieved/v1";
	content: {
		userID: integer;
		goalID: string;
		old: GoalImportStat;
		new: GoalImportStat;
		game: Game;
		playtype: Playtypes[Game];
	};
}

/**
 * An event fired when a milestone is achieved.
 */
export interface WebhookEventMilestoneAchievedV1 {
	type: "milestone-achieved/v1";
	content: {
		userID: integer;
		milestoneID: string;
		old: MilestoneImportStat;
		new: MilestoneImportStat;
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
	| WebhookEventMilestoneAchievedV1;
