import { IIDXDans } from "lib/constants/classes";
import { ClassHandler } from "lib/score-import/framework/user-game-stats/types";
import nodeFetch from "utils/fetch";
import { KaiTypeToBaseURL } from "utils/misc";

export async function CreateKaiIIDXClassHandler(
	kaiType: "FLO" | "EAG",
	token: string,
	fetch = nodeFetch
): Promise<ClassHandler> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let json: any;
	let err: unknown;
	const baseUrl = KaiTypeToBaseURL(kaiType);

	// SP and DP dans are located in the same place,
	// fetch once, then return a function that traverses this data.
	try {
		const res = await fetch(`${baseUrl}/api/iidx/v2/player_profile`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		json = await res.json();
	} catch (e) {
		err = e;
	}

	return (game, playtype, userID, ratings, logger) => {
		if (err) {
			logger.error(`An error occured while updating classes for ${baseUrl}.`, { err });
			return {};
		}

		let iidxDan: number | null;

		if (playtype === "SP") {
			iidxDan = json.sp;
		} else if (playtype === "DP") {
			iidxDan = json.dp;
		} else {
			logger.warn(`KAIIIDXClassUpdater called with invalid playtype of ${playtype}.`);
			return {};
		}

		if (iidxDan === null) {
			return {};
		}

		if (!Number.isInteger(iidxDan)) {
			logger.warn(`${baseUrl} returned a dan of ${iidxDan}, which was not a number.`);
			return {};
		}

		if (iidxDan > IIDXDans.KAIDEN) {
			logger.warn(
				`${baseUrl} returned a dan of ${iidxDan}, which was greater than KAIDEN (${IIDXDans.KAIDEN}.)`
			);
			return {};
		}

		if (iidxDan < IIDXDans.KYU_7) {
			logger.warn(
				`${baseUrl} returned a dan of ${iidxDan}, which was less than KYU_7 (${IIDXDans.KYU_7}.)`
			);
			return {};
		}

		return {
			dan: iidxDan,
		};
	};
}
