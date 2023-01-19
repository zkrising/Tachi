import { GPT_SERVER_IMPLEMENTATIONS } from "game-implementations/game-implementations";
import type { ClassDeriver } from "game-implementations/types";
import type { ExtractedClasses, GPTString, UserGameStats } from "tachi-common";

export function CalculateDerivedClasses<GPT extends GPTString>(
	gptString: GPT,
	profileRatings: UserGameStats["ratings"]
) {
	const derivedClasses: Record<string, string> = {};

	for (const [key, fn] of Object.entries(GPT_SERVER_IMPLEMENTATIONS[gptString].classDerivers)) {
		const deriver = fn as ClassDeriver<GPT, any>;

		derivedClasses[key] = deriver(profileRatings);
	}

	return derivedClasses as Partial<ExtractedClasses[GPT]>;
}
