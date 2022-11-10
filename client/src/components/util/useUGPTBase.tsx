import { useMemo } from "react";
import { UserDocument } from "tachi-common";
import { GamePT, UGPT } from "types/react";

export default function useUGPTBase({ reqUser, game, playtype }: UGPT) {
	return useMemo(
		() => `/dashboard/users/${reqUser.username}/games/${game}/${playtype}`,
		[reqUser, game, playtype]
	);
}
