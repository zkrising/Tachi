import {
	FolderDocument,
	TableDocument,
	SessionDocument,
	ScoreDocument,
	ChartDocument,
	PublicUserDocument,
	UserGameStats,
	Game,
	Playtypes,
	SongDocument,
	UserSettings,
	TachiAPIClientDocument,
	GoalDocument,
	MilestoneSubscriptionDocument,
	GoalSubscriptionDocument,
	MilestoneDocument,
	MilestoneSetDocument,
	integer,
} from "tachi-common";

declare module "express-session" {
	// Inject additional properties on express-session
	interface SessionData {
		tachi: TachiSessionData;
	}
}

export interface TachiSessionData {
	user: PublicUserDocument;
	settings: UserSettings;
}

export interface TachiAPIFailResponse {
	success: false;
	description: string;
}

export interface TachiAPISuccessResponse {
	success: true;
	description: string;
	body: Record<string, unknown>;
}

export type TachiAPIReponse = TachiAPIFailResponse | TachiAPISuccessResponse;

/**
 * Clarity type for empty objects - such as in context.
 */
export type EmptyObject = Record<string, never>;

/**
 * Data that may be monkey-patched onto req.tachi. This holds things such as middleware results.
 */
export interface TachiRequestData {
	uscChartDoc?: ChartDocument<"usc:Controller" | "usc:Keyboard">;

	beatorajaChartDoc?: ChartDocument<"bms:7K" | "bms:14K" | "pms:Controller" | "pms:Keyboard">;

	requestedUser?: PublicUserDocument;
	requestedUserGameStats?: UserGameStats;
	game?: Game;
	playtype?: Playtypes[Game];

	chartDoc?: ChartDocument;
	songDoc?: SongDocument;
	scoreDoc?: ScoreDocument;
	sessionDoc?: SessionDocument;
	tableDoc?: TableDocument;
	folderDoc?: FolderDocument;
	goalDoc?: GoalDocument;
	milestoneDoc?: MilestoneDocument;
	goalSubDoc?: GoalSubscriptionDocument;
	milestoneSubDoc?: MilestoneSubscriptionDocument;
	milestoneSetDoc?: MilestoneSetDocument;

	apiClientDoc: Omit<TachiAPIClientDocument, "clientSecret">;
}

// This is only used on tachi-server, and isn't exposed -- so shouldn't be a part
// of common.
export interface PrivateUserInfoDocument {
	userID: integer;
	password: string;
	email: string;
}
