import { IsNullish } from "utils/misc";
import type { ClassDeriver, GPTClassDerivers } from "./types";
import type {
	ExtractedClasses,
	GPTString,
	SpecificUserGameStats,
	UserGameStats,
} from "tachi-common";

function VF6ToClass(vf: number): SpecificUserGameStats<"sdvx:Single">["classes"]["vfClass"] {
	// jesus christ man
	if (vf >= 23) {
		return "IMPERIAL_IV";
	} else if (vf >= 22) {
		return "IMPERIAL_III";
	} else if (vf >= 21) {
		return "IMPERIAL_II";
	} else if (vf >= 20) {
		return "IMPERIAL_I";
	} else if (vf >= 19.75) {
		return "CRIMSON_IV";
	} else if (vf > 19.5) {
		return "CRIMSON_III";
	} else if (vf >= 19.25) {
		return "CRIMSON_II";
	} else if (vf >= 19) {
		return "CRIMSON_I";
	} else if (vf >= 18.75) {
		return "ELDORA_IV";
	} else if (vf >= 18.5) {
		return "ELDORA_III";
	} else if (vf >= 18.25) {
		return "ELDORA_II";
	} else if (vf >= 18) {
		return "ELDORA_I";
	} else if (vf >= 17.75) {
		return "ARGENTO_IV";
	} else if (vf >= 17.5) {
		return "ARGENTO_III";
	} else if (vf >= 17.25) {
		return "ARGENTO_II";
	} else if (vf >= 17) {
		return "ARGENTO_I";
	} else if (vf >= 16.75) {
		return "CORAL_IV";
	} else if (vf >= 16.5) {
		return "CORAL_III";
	} else if (vf >= 16.25) {
		return "CORAL_II";
	} else if (vf >= 16) {
		return "CORAL_I";
	} else if (vf >= 15.75) {
		return "SCARLET_IV";
	} else if (vf >= 15.5) {
		return "SCARLET_III";
	} else if (vf >= 15.25) {
		return "SCARLET_II";
	} else if (vf >= 15) {
		return "SCARLET_I";
	} else if (vf >= 14.75) {
		return "CYAN_IV";
	} else if (vf >= 14.5) {
		return "CYAN_III";
	} else if (vf >= 14.25) {
		return "CYAN_II";
	} else if (vf >= 14) {
		return "CYAN_I";
	} else if (vf >= 13.5) {
		return "DANDELION_IV";
	} else if (vf >= 13) {
		return "DANDELION_III";
	} else if (vf >= 12.5) {
		return "DANDELION_II";
	} else if (vf >= 12) {
		return "DANDELION_I";
	} else if (vf >= 11.5) {
		return "COBALT_IV";
	} else if (vf >= 11) {
		return "COBALT_III";
	} else if (vf >= 10.5) {
		return "COBALT_II";
	} else if (vf >= 10) {
		return "COBALT_I";
	} else if (vf >= 7.5) {
		return "SIENNA_IV";
	} else if (vf >= 5) {
		return "SIENNA_III";
	} else if (vf >= 2.5) {
		return "SIENNA_II";
	}

	return "SIENNA_I";
}

function GitadoraSkillToColour(sk: number) {
	if (sk >= 8500) {
		return "RAINBOW";
	} else if (sk >= 8000) {
		return "GOLD";
	} else if (sk >= 7500) {
		return "SILVER";
	} else if (sk >= 7000) {
		return "BRONZE";
	} else if (sk >= 6500) {
		return "RED_GRD";
	} else if (sk >= 6000) {
		return "RED";
	} else if (sk >= 5500) {
		return "PURPLE_GRD";
	} else if (sk >= 5000) {
		return "PURPLE";
	} else if (sk >= 4500) {
		return "BLUE_GRD";
	} else if (sk >= 4000) {
		return "BLUE";
	} else if (sk >= 3500) {
		return "GREEN_GRD";
	} else if (sk >= 3000) {
		return "GREEN";
	} else if (sk >= 2500) {
		return "YELLOW_GRD";
	} else if (sk >= 2000) {
		return "YELLOW";
	} else if (sk >= 1500) {
		return "ORANGE_GRD";
	} else if (sk >= 1000) {
		return "ORANGE";
	}

	return "WHITE";
}

export const CLASS_DERIVERS: GPTClassDerivers = {
	"bms:14K": {},
	"bms:7K": {},
	"iidx:DP": {},
	"iidx:SP": {},
	"itg:Stamina": {},

	"museca:Single": {},
	"pms:Controller": {},
	"pms:Keyboard": {},

	"chunithm:Single": {
		colour: (ratings) => {
			const rating = ratings.naiveRating;

			if (IsNullish(rating)) {
				return null;
			}

			if (rating >= 15) {
				return "RAINBOW";
			} else if (rating >= 14.5) {
				return "PLATINUM";
			} else if (rating >= 14) {
				return "GOLD";
			} else if (rating >= 13) {
				return "SILVER";
			} else if (rating >= 12) {
				return "COPPER";
			} else if (rating >= 10) {
				return "PURPLE";
			} else if (rating >= 7) {
				return "RED";
			} else if (rating >= 4) {
				return "ORANGE";
			} else if (rating >= 2) {
				return "GREEN";
			}

			return "BLUE";
		},
	},
	"gitadora:Dora": {
		colour: (ratings) => {
			if (IsNullish(ratings.skill)) {
				return null;
			}

			return GitadoraSkillToColour(ratings.skill);
		},
	},
	"gitadora:Gita": {
		colour: (ratings) => {
			if (IsNullish(ratings.skill)) {
				return null;
			}

			return GitadoraSkillToColour(ratings.skill);
		},
	},

	"jubeat:Single": {
		colour: (ratings) => {
			const jubility = ratings.jubility;

			if (IsNullish(jubility)) {
				return null;
			}

			if (jubility >= 9500) {
				return "GOLD";
			} else if (jubility >= 8500) {
				return "ORANGE";
			} else if (jubility >= 7000) {
				return "PINK";
			} else if (jubility >= 5500) {
				return "PURPLE";
			} else if (jubility >= 4000) {
				return "VIOLET";
			} else if (jubility >= 2500) {
				return "BLUE";
			} else if (jubility >= 1500) {
				return "LIGHT_BLUE";
			} else if (jubility >= 750) {
				return "GREEN";
			} else if (jubility >= 250) {
				return "YELLOW_GREEN";
			}

			return "BLACK";
		},
	},
	"maimaidx:Single": {
		colour: (ratings) => {
			const rate = ratings.rate;

			if (IsNullish(rate)) {
				return null;
			}

			if (rate >= 15000) {
				return "RAINBOW";
			} else if (rate >= 14500) {
				return "PLATINUM";
			} else if (rate >= 14000) {
				return "GOLD";
			} else if (rate >= 13000) {
				return "SILVER";
			} else if (rate >= 12000) {
				return "BRONZE";
			} else if (rate >= 10000) {
				return "PURPLE";
			} else if (rate >= 7000) {
				return "RED";
			} else if (rate >= 4000) {
				return "YELLOW";
			} else if (rate >= 2000) {
				return "GREEN";
			} else if (rate >= 1000) {
				return "BLUE";
			}

			return "WHITE";
		},
	},

	"popn:9B": {
		class: (ratings) => {
			const points = ratings.naiveClassPoints;

			if (IsNullish(points)) {
				return null;
			}

			if (points < 21) {
				return "KITTY";
			} else if (points < 34) {
				return "STUDENT";
			} else if (points < 46) {
				return "DELINQUENT";
			} else if (points < 59) {
				return "DETECTIVE";
			} else if (points < 68) {
				return "IDOL";
			} else if (points < 79) {
				return "GENERAL";
			} else if (points < 91) {
				return "HERMIT";
			}

			return "GOD";
		},
	},
	"sdvx:Single": {
		vfClass: (ratings) => {
			const vf6 = ratings.VF6;

			if (IsNullish(vf6)) {
				return null;
			}

			return VF6ToClass(vf6);
		},
	},
	"usc:Controller": {
		vfClass: (ratings) => {
			const vf6 = ratings.VF6;

			if (IsNullish(vf6)) {
				return null;
			}

			return VF6ToClass(vf6);
		},
	},
	"usc:Keyboard": {
		vfClass: (ratings) => {
			const vf6 = ratings.VF6;

			if (IsNullish(vf6)) {
				return null;
			}

			return VF6ToClass(vf6);
		},
	},

	"wacca:Single": {
		colour: (ratings) => {
			const rate = ratings.rate;

			if (IsNullish(rate)) {
				return null;
			}

			if (rate >= 2500) {
				return "RAINBOW";
			} else if (rate >= 2200) {
				return "GOLD";
			} else if (rate >= 1900) {
				return "SILVER";
			} else if (rate >= 1600) {
				return "BLUE";
			} else if (rate >= 1300) {
				return "PURPLE";
			} else if (rate >= 1000) {
				return "RED";
			} else if (rate >= 600) {
				return "YELLOW";
			} else if (rate >= 300) {
				return "NAVY";
			}

			return "ASH";
		},
	},
};

export function CalculateDerivedClasses<GPT extends GPTString>(
	gptString: GPT,
	profileRatings: UserGameStats["ratings"]
) {
	const derivedClasses: Record<string, string> = {};

	for (const [key, fn] of Object.entries(CLASS_DERIVERS[gptString])) {
		const deriver = fn as ClassDeriver<GPT, any>;

		derivedClasses[key] = deriver(profileRatings);
	}

	return derivedClasses as Partial<ExtractedClasses[GPT]>;
}
