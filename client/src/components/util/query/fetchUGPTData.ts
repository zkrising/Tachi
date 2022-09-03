import { APIFetchV1 } from "util/api";
import {
	FormatGame,
	Game,
	Playtype,
	PublicUserDocument,
	UGPTSettings,
	UserGameStats,
} from "tachi-common";
import { UGPTStatsReturn } from "types/api-returns";

/**
 * Assorted contexts meant to be kept around when in the User Game Playtype state.
 *
 * It's worth keeping this around for both the currently-viewed user and the currently-logged-in user.
 */
export interface UGPTData {
	settings: UGPTSettings;
	stats: UserGameStats;
	game: Game;
	playtype: Playtype;
	user: PublicUserDocument;
}

/**
 * Given a userID, fetch important information about their ability
 * on this game.
 */
export default async function fetchUGPTData(
	userID: number | string,
	game: Game,
	playtype: Playtype
): Promise<UGPTData | null> {
	const statsRes = await APIFetchV1<UGPTStatsReturn>(
		`/users/${userID}/games/${game}/${playtype}`
	);

	// user doesn't exist or something?
	if (statsRes.statusCode === 404) {
		return null;
	}

	if (!statsRes.success) {
		throw new Error(
			`Failed to fetch data for ${userID} (${FormatGame(game, playtype)}): ${
				statsRes.description
			}`
		);
	}

	const settingsRes = await APIFetchV1<UGPTSettings>(
		`/users/${userID}/games/${game}/${playtype}/settings`
	);

	if (!settingsRes.success) {
		throw new Error(
			`Failed to fetch settings for ${userID} (${FormatGame(game, playtype)}): ${
				settingsRes.description
			}`
		);
	}

	const userRes = await APIFetchV1<PublicUserDocument>(`/users/${userID}`);

	if (!userRes.success) {
		throw new Error(`Failed to fetch user info for ${userID}: ${userRes.description}`);
	}

	return {
		game,
		playtype,
		settings: settingsRes.body,
		stats: statsRes.body.gameStats,
		user: userRes.body,
	};
}
