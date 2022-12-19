import { useMemo } from "react";
import { UGPT } from "types/react";

export default function useUGPTBase({ reqUser, game, playtype }: UGPT) {
	return useMemo(
		() => `/u/${reqUser.username}/games/${game}/${playtype}`,
		[reqUser, game, playtype]
	);
}
