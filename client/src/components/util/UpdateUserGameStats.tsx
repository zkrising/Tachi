import { APIFetchV1 } from "util/api";
import { UserGameStats } from "tachi-common";
import { SetState } from "types/react";

export default async function UpdateUserGameStats(setUGS: SetState<UserGameStats[] | null>) {
	const res = await APIFetchV1<UserGameStats[]>("/users/me/game-stats");

	if (!res.success) {
		setUGS(null);
		return;
	}

	setUGS(res.body);
}
