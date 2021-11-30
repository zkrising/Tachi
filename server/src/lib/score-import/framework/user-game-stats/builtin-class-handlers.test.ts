import t from "tap";
import { GitadoraColours, SDVXVFClasses } from "lib/constants/classes";
import CreateLogCtx from "lib/logger/logger";
import {
	CalculateGitadoraColour,
	GitadoraSkillToColour,
	CalculateSDVXClass,
	SDVXVF6ToClass,
} from "./builtin-class-handlers";

const logger = CreateLogCtx(__filename);

t.test("#CalculateGitadoraColour", (t) => {
	t.strictSame(
		CalculateGitadoraColour("gitadora", "Gita", 1, { skill: 1500 }, logger),
		{
			colour: GitadoraColours.ORANGE_GRADIENT,
		},
		"Should wrap the skill colour."
	);

	t.end();
});

t.test("#GitadoraSkillToColour", (t) => {
	t.equal(GitadoraSkillToColour(0), GitadoraColours.WHITE);
	t.equal(GitadoraSkillToColour(999), GitadoraColours.WHITE);
	t.equal(GitadoraSkillToColour(1000), GitadoraColours.ORANGE);
	t.equal(GitadoraSkillToColour(1500), GitadoraColours.ORANGE_GRADIENT);
	t.equal(GitadoraSkillToColour(2000), GitadoraColours.YELLOW);
	t.equal(GitadoraSkillToColour(2500), GitadoraColours.YELLOW_GRADIENT);
	t.equal(GitadoraSkillToColour(3000), GitadoraColours.GREEN);
	t.equal(GitadoraSkillToColour(3500), GitadoraColours.GREEN_GRADIENT);
	t.equal(GitadoraSkillToColour(4000), GitadoraColours.BLUE);
	t.equal(GitadoraSkillToColour(4500), GitadoraColours.BLUE_GRADIENT);
	t.equal(GitadoraSkillToColour(5000), GitadoraColours.PURPLE);
	t.equal(GitadoraSkillToColour(5500), GitadoraColours.PURPLE_GRADIENT);
	t.equal(GitadoraSkillToColour(6000), GitadoraColours.RED);
	t.equal(GitadoraSkillToColour(6500), GitadoraColours.RED_GRADIENT);
	t.equal(GitadoraSkillToColour(7000), GitadoraColours.BRONZE);
	t.equal(GitadoraSkillToColour(7500), GitadoraColours.SILVER);
	t.equal(GitadoraSkillToColour(8000), GitadoraColours.GOLD);
	t.equal(GitadoraSkillToColour(8500), GitadoraColours.RAINBOW);

	t.end();
});

t.test("#CalculateSDVXClass", (t) => {
	t.strictSame(CalculateSDVXClass("sdvx", "Single", 1, { VF6: 10 }, logger), {
		vfClass: SDVXVFClasses.COBALT_I,
	});

	t.end();
});

t.test("#SDVXVF6ToClass", (t) => {
	function f(vf: number) {
		return SDVXVF6ToClass(vf, logger);
	}

	t.equal(f(0), SDVXVFClasses.SIENNA_I);
	t.equal(f(2.5), SDVXVFClasses.SIENNA_II);
	t.equal(f(5), SDVXVFClasses.SIENNA_III);
	t.equal(f(7.5), SDVXVFClasses.SIENNA_IV);
	t.equal(f(10), SDVXVFClasses.COBALT_I);
	t.equal(f(10.5), SDVXVFClasses.COBALT_II);
	t.equal(f(11), SDVXVFClasses.COBALT_III);
	t.equal(f(11.5), SDVXVFClasses.COBALT_IV);
	t.equal(f(12), SDVXVFClasses.DANDELION_I);
	t.equal(f(12.5), SDVXVFClasses.DANDELION_II);
	t.equal(f(13), SDVXVFClasses.DANDELION_III);
	t.equal(f(13.5), SDVXVFClasses.DANDELION_IV);

	t.equal(f(14), SDVXVFClasses.CYAN_I);
	t.equal(f(14.25), SDVXVFClasses.CYAN_II);
	t.equal(f(14.5), SDVXVFClasses.CYAN_III);
	t.equal(f(14.75), SDVXVFClasses.CYAN_IV);
	t.equal(f(15), SDVXVFClasses.SCARLET_I);
	t.equal(f(15.25), SDVXVFClasses.SCARLET_II);
	t.equal(f(15.5), SDVXVFClasses.SCARLET_III);
	t.equal(f(15.75), SDVXVFClasses.SCARLET_IV);
	t.equal(f(16), SDVXVFClasses.CORAL_I);
	t.equal(f(16.25), SDVXVFClasses.CORAL_II);
	t.equal(f(16.5), SDVXVFClasses.CORAL_III);
	t.equal(f(16.75), SDVXVFClasses.CORAL_IV);
	t.equal(f(17), SDVXVFClasses.ARGENTO_I);
	t.equal(f(17.25), SDVXVFClasses.ARGENTO_II);
	t.equal(f(17.5), SDVXVFClasses.ARGENTO_III);
	t.equal(f(17.75), SDVXVFClasses.ARGENTO_IV);
	t.equal(f(18), SDVXVFClasses.ELDORA_I);
	t.equal(f(18.25), SDVXVFClasses.ELDORA_II);
	t.equal(f(18.5), SDVXVFClasses.ELDORA_III);
	t.equal(f(18.75), SDVXVFClasses.ELDORA_IV);
	t.equal(f(19), SDVXVFClasses.CRIMSON_I);
	t.equal(f(19.25), SDVXVFClasses.CRIMSON_II);
	t.equal(f(19.5), SDVXVFClasses.CRIMSON_III);
	t.equal(f(19.75), SDVXVFClasses.CRIMSON_IV);

	t.equal(f(20), SDVXVFClasses.IMPERIAL_I);
	t.equal(f(21), SDVXVFClasses.IMPERIAL_II);
	t.equal(f(22), SDVXVFClasses.IMPERIAL_III);
	t.equal(f(23), SDVXVFClasses.IMPERIAL_IV);
	t.equal(f(24), SDVXVFClasses.IMPERIAL_IV);
	t.equal(f(1000), SDVXVFClasses.IMPERIAL_IV);

	t.end();
});
