import { Game, GetGamePTConfig, Playtypes } from "tachi-common";

export function HumanFriendlyStrToGradeIndex(game: Game, playtype: Playtypes[Game]) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const lowerGrades = gptConfig.grades.map(e => e.toLowerCase());

	return (str: string) => {
		const lowerStr = str.toLowerCase();
		let partialMatch: number | null = null;

		for (let i = 0; i < gptConfig.grades.length; i++) {
			const grade = lowerGrades[i];

			if (grade === lowerStr) {
				return i;
			}

			if (grade.startsWith(lowerStr) && partialMatch === null) {
				partialMatch = i;
			}
		}

		return partialMatch;
	};
}

export function HumanFriendlyStrToLampIndex(game: Game, playtype: Playtypes[Game]) {
	const gptConfig = GetGamePTConfig(game, playtype);
	const lowerLamps = gptConfig.lamps.map(e => e.toLowerCase());

	return (str: string) => {
		const lowerStr = str.toLowerCase();
		let partialMatch: number | null = null;

		for (let i = 0; i < gptConfig.lamps.length; i++) {
			const lamp = lowerLamps[i];

			if (lamp === lowerStr) {
				return i;
			}

			if (lamp.startsWith(lowerStr) && partialMatch === null) {
				partialMatch = i;
			}
		}	

		return partialMatch;
	};
}
