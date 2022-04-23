import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { FindOneResult } from "monk";
import {
	APITokenDocument,
	Game,
	GetGamePTConfig,
	IDStrings,
	integer,
	Playtype,
	PublicUserDocument,
	UGSRatingsLookup,
	UserAuthLevels,
	UserGameStats,
} from "tachi-common";

const logger = CreateLogCtx(__filename);

/**
 * Returns a user's username from their ID. Throws if no user with that ID exists.
 */
export async function GetUsernameFromUserID(userID: integer): Promise<string> {
	const partialDoc = await db.users.findOne(
		{
			id: userID,
		},
		{
			projection: {
				username: 1,
			},
		}
	);

	if (!partialDoc) {
		throw new Error(`Could not find username for userID ${userID}.`);
	}

	return partialDoc.username;
}

/**
 * Gets a user based on their username case-insensitively.
 */
export function GetUserCaseInsensitive(
	username: string
): Promise<FindOneResult<PublicUserDocument>> {
	return db.users.findOne({
		usernameLowercase: username.toLowerCase(),
	}) as Promise<FindOneResult<PublicUserDocument>>;
}

export async function CheckIfEmailInUse(email: string) {
	const doc = await db["user-private-information"].findOne({ email });

	return !!doc;
}

export function GetUserPrivateInfo(userID: integer) {
	return db["user-private-information"].findOne({ userID });
}

/**
 * Gets a user from their userID.
 */
export function GetUserWithID(userID: integer): Promise<FindOneResult<PublicUserDocument>> {
	return db.users.findOne({
		id: userID,
	}) as Promise<FindOneResult<PublicUserDocument>>;
}

export function GetSettingsForUser(userID: integer) {
	return db["user-settings"].findOne({
		userID: userID,
	});
}

/**
 * Gets the users for these user IDs.
 */
export async function GetUsersWithIDs(userIDs: integer[]) {
	const users = await db.users.find({
		id: { $in: userIDs },
	});

	// Note that we should dedupe this by making a set
	// as passing [1, 1, 1] is perfectly legal to this function.
	if (users.length !== new Set(userIDs).size) {
		logger.severe(
			`GetUsersWithIDs was given ${userIDs.length} userIDs, but only matched ${users.length} -- state desync likely.`,
			{ userIDs, users }
		);
		throw new Error(
			`GetUsersWithIDs was given ${userIDs.length} userIDs, but only matched ${users.length}.`
		);
	}

	return users;
}

/**
 * Retrieve a user document that is expected to exist.
 * If the user document is not found, a severe error is logged, and this
 * function throws.
 */
export async function GetUserWithIDGuaranteed(userID: integer): Promise<PublicUserDocument> {
	const userDoc = await GetUserWithID(userID);

	if (!userDoc) {
		logger.severe(
			`User ${userID} does not have an associated user document, but one was expected.`
		);
		throw new Error(
			`User ${userID} does not have an associated user document, but one was expected.`
		);
	}

	return userDoc;
}

/**
 * Gets a user based on either their username case-insensitively, or a direct lookup of their ID.
 * This is used in URLs to resolve the passed user.
 */
export function ResolveUser(usernameOrID: string) {
	// user ID passed
	if (usernameOrID.match(/^[0-9]+$/u)) {
		const intID = Number(usernameOrID);

		return GetUserWithID(intID);
	}

	return GetUserCaseInsensitive(usernameOrID);
}

/**
 * Returns a formatted string indicating the user. This is used for logging.
 */
export function FormatUserDoc(userdoc: PublicUserDocument) {
	return `${userdoc.username} (#${userdoc.id})`;
}

export async function GetUsersRanking(stats: UserGameStats) {
	const gptConfig = GetGamePTConfig(stats.game, stats.playtype);

	const aggRes = await db["game-stats"].aggregate([
		{
			$match: {
				game: stats.game,
				playtype: stats.playtype,
			},
		},
		{
			$group: {
				_id: null,
				ranking: {
					$sum: {
						$cond: {
							if: {
								$gt: [
									`$ratings.${gptConfig.defaultProfileRatingAlg}`,
									stats.ratings[gptConfig.defaultProfileRatingAlg],
								],
							},
							then: 1,
							else: 0,
						},
					},
				},
			},
		},
	]);

	return (aggRes[0].ranking + 1) as integer;
}

export function GetUGPTPlaycount(userID: integer, game: Game, playtype: Playtype) {
	return db.scores.count({ userID, game, playtype });
}

export async function GetAllRankings(stats: UserGameStats) {
	const gptConfig = GetGamePTConfig(stats.game, stats.playtype);

	const entries = await Promise.all(
		gptConfig.profileRatingAlgs.map((k) =>
			GetUsersRankingAndOutOf(stats, k).then((r) => [k, r])
		)
	);

	return Object.fromEntries(entries);
}

export async function GetUsersRankingAndOutOf(
	stats: UserGameStats,
	alg?: UGSRatingsLookup[IDStrings]
) {
	const gptConfig = GetGamePTConfig(stats.game, stats.playtype);

	const ratingAlg = alg ?? gptConfig.defaultProfileRatingAlg;

	const aggRes = await db["game-stats"].aggregate([
		{
			$match: {
				game: stats.game,
				playtype: stats.playtype,
			},
		},
		{
			$group: {
				_id: null,
				outOf: { $sum: 1 },
				ranking: {
					$sum: {
						$cond: {
							if: {
								$gt: [`$ratings.${ratingAlg}`, stats.ratings[ratingAlg]],
							},
							then: 1,
							else: 0,
						},
					},
				},
			},
		},
	]);

	return {
		ranking: (aggRes[0].ranking + 1) as integer,
		outOf: aggRes[0].outOf as integer,
	};
}

const FIVE_MINUTES = 1000 * 60 * 5;

/**
 * Returns the cutoff point for "being online" in tachi. This means the user
 * has made any page request in the past 5 minutes.
 */
export function GetOnlineCutoff() {
	return Date.now() - FIVE_MINUTES;
}

/**
 * Returns whether a given userID is an administrator or not.
 */
export async function IsRequesterAdmin(request: APITokenDocument) {
	// API Tokens created on the behalf of an admin do NOT inherit admin permissions.
	if (request.token !== null) {
		return false;
	}

	if (!request.userID) {
		return false;
	}

	const user = await GetUserWithIDGuaranteed(request.userID);

	return user.authLevel === UserAuthLevels.ADMIN;
}
