import { Game, Playtypes, integer, ScoreCalculatedDataLookup } from "tachi-common";
import { GameClasses } from "tachi-common/js/game-classes";
import { GitadoraColours, SDVXVFClasses } from "../../../constants/classes";
import { KtLogger } from "../../../logger/logger";

export function CalculateSDVXClass(
	game: Game,
	playtype: Playtypes[Game],
	userID: integer,
	ratings: Partial<Record<ScoreCalculatedDataLookup["sdvx:Single"], number>>,
	logger: KtLogger
): Partial<GameClasses<"sdvx:Single">> {
	if (!ratings.VF6) {
		return {};
	}

	return { vfClass: SDVXVF6ToClass(ratings.VF6, logger) };
}

/**
 * Converts a user's profile VF6 to a class. There are almost 40 classes, and writing
 * if statements for all of them is a painful endeavour. This function returns an index
 * derived from the gaps between classes, to avoid writing out all those statements.
 * @see https://bemaniwiki.com/index.php?SOUND%20VOLTEX%20VIVID%20WAVE/VOLFORCE
 */
export function SDVXVF6ToClass(vf: number, logger: KtLogger) {
	// This is impossible, but a failsafe regardless
	if (vf >= 24) {
		logger.warn(`User has excessive VF5 of ${vf}. Defaulting to Imperial IV.`);
		return SDVXVFClasses.IMPERIAL_IV;
	} else if (vf >= 20) {
		// imperial i -> iv has gaps of 1
		return SDVXVFClasses.IMPERIAL_I + Math.floor(vf - 20);
	} else if (vf >= 14) {
		// cyan i -> crimson iv has gaps of 0.25
		return SDVXVFClasses.CYAN_I + Math.floor(4 * (vf - 14));
	} else if (vf >= 10) {
		// cobalt i -> dandelion iv have gaps of 0.5
		return SDVXVFClasses.COBALT_I + Math.floor(2 * (vf - 10));
	}

	return Math.floor(vf / 2.5);
}

export function CalculateGitadoraColour(
	game: Game,
	playtype: Playtypes[Game],
	userID: integer,
	ratings: Record<string, number>,
	logger: KtLogger
): Partial<GameClasses<"gitadora:Dora" | "gitadora:Gita">> {
	const colour = GitadoraSkillToColour(ratings.skill);

	return {
		colour,
	};
}

export function GitadoraSkillToColour(sk: number) {
	if (sk >= 8500) {
		return GitadoraColours.RAINBOW;
	} else if (sk >= 8000) {
		return GitadoraColours.GOLD;
	} else if (sk >= 7500) {
		return GitadoraColours.SILVER;
	} else if (sk >= 7000) {
		return GitadoraColours.BRONZE;
	} else if (sk >= 6500) {
		return GitadoraColours.RED_GRADIENT;
	} else if (sk >= 6000) {
		return GitadoraColours.RED;
	} else if (sk >= 5500) {
		return GitadoraColours.PURPLE_GRADIENT;
	} else if (sk >= 5000) {
		return GitadoraColours.PURPLE;
	} else if (sk >= 4500) {
		return GitadoraColours.BLUE_GRADIENT;
	} else if (sk >= 4000) {
		return GitadoraColours.BLUE;
	} else if (sk >= 3500) {
		return GitadoraColours.GREEN_GRADIENT;
	} else if (sk >= 3000) {
		return GitadoraColours.GREEN;
	} else if (sk >= 2500) {
		return GitadoraColours.YELLOW_GRADIENT;
	} else if (sk >= 2000) {
		return GitadoraColours.YELLOW;
	} else if (sk >= 1500) {
		return GitadoraColours.ORANGE_GRADIENT;
	} else if (sk >= 1000) {
		return GitadoraColours.ORANGE;
	}

	return GitadoraColours.WHITE;
}

// export function CalculateJubeatColour(
// 	game: Game,
// 	playtype: Playtypes[Game],
// 	userID: integer,
// 	ratings: Record<string, number>
// ): GameClasses<"jubeat:Single"> {
// 	throw new Error("Not implemented.");
// }

// function JubilityToColour(jb: number) {}
