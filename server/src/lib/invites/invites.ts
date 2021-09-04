import { ONE_MONTH } from "lib/constants/time";
import { PublicUserDocument } from "tachi-common";

// These aren't controlled by config because they only apply
// to kamaitachi, and I'm lazy in that regard.
const INVITE_BATCH_SIZE = 2;
const INVITE_CAP = 100;
const BETA_USER_BONUS = 5;

/**
 * Users are only allowed to invite so many users, and their invites are
 * trickled out in bursts of INVITE_BATCH_SIZE.
 *
 * Users get those N additional invites every month since they join.
 * This is capped at INVITE_CAP, which defaults to 100.
 */
export function GetTotalAllowedInvites(user: PublicUserDocument) {
	const joinedSince = Date.now() - user.joinDate;

	const monthsSinceJoin = Math.floor(joinedSince / ONE_MONTH);

	let invites = monthsSinceJoin * INVITE_BATCH_SIZE;

	if (user.badges.includes("alpha") || user.badges.includes("beta")) {
		invites += BETA_USER_BONUS;
	}

	if (invites > INVITE_CAP) {
		return INVITE_CAP;
	}

	return invites;
}
