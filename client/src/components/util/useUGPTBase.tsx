import { useMemo } from "react";
import { UserDocument } from "tachi-common";
import { GamePT } from "types/react";

export default function useUGPTBase({
	reqUser,
	game,
	playtype,
}: { reqUser: UserDocument } & GamePT) {
	return useMemo(
		() => `/dashboard/users/${reqUser.username}/games/${game}/${playtype}`,
		[reqUser, game, playtype]
	);
}
