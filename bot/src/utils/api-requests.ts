import { integer, PublicUserDocument } from "tachi-common";
import { TachiServerV1Get } from "./fetch-tachi";

export async function GetUserInfo(userID: integer) {
	const res = await TachiServerV1Get<PublicUserDocument>(`/users/${userID}`, null);

	if (!res.success) {
		throw new Error(`Failed to fetch user with userID ${userID}.`);
	}

	return res.body;
}
