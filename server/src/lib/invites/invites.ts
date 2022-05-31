import { ONE_MONTH } from "lib/constants/time";
import CreateLogCtx from "lib/logger/logger";
import { ServerConfig } from "lib/setup/config";
import type { PublicUserDocument } from "tachi-common";

const logger = CreateLogCtx(__filename);

/**
 * Users are only allowed to invite so many users, and their invites are
 * trickled out in bursts of INVITE_BATCH_SIZE.
 *
 * Users get those N additional invites every month since they join.
 * This is capped at INVITE_CAP, which defaults to 100.
 */
export function GetTotalAllowedInvites(user: PublicUserDocument) {
	if (!ServerConfig.INVITE_CODE_CONFIG) {
		logger.warn(
			`No INVITE_CODE_CONFIG set, but tried to get total allowed invites? Returning 0.`
		);
		return 0;
	}

	const joinedSince = Date.now() - user.joinDate;

	const monthsSinceJoin = Math.floor(joinedSince / ONE_MONTH);

	let invites = monthsSinceJoin * ServerConfig.INVITE_CODE_CONFIG.BATCH_SIZE;

	if (user.badges.includes("alpha") || user.badges.includes("beta")) {
		invites = invites + ServerConfig.INVITE_CODE_CONFIG.BETA_USER_BONUS;
	}

	if (invites > ServerConfig.INVITE_CODE_CONFIG.INVITE_CAP) {
		return ServerConfig.INVITE_CODE_CONFIG.INVITE_CAP;
	}

	return invites;
}
