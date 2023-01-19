import { Game, GetGamePTConfig, GetScoreMetricConf, Playtypes } from "tachi-common";

export function HumanFriendlyStrToEnumIndex(
	game: Game,
	playtype: Playtypes[Game],
	enumMetric: string
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const conf = GetScoreMetricConf(gptConfig, enumMetric);

	if (conf?.type !== "ENUM") {
		return () => 0; // wut
	}

	const lowerValues = conf.values.map((e) => e.toLowerCase());

	return (str: string) => {
		const lowerStr = str.toLowerCase();
		let partialMatch: number | null = null;

		for (let i = 0; i < conf.values.length; i++) {
			const value = lowerValues[i];

			if (value === lowerStr) {
				return i;
			}

			if (value.startsWith(lowerStr) && partialMatch === null) {
				partialMatch = i;
			}
		}

		return partialMatch;
	};
}
