import {
	CalculateGitadoraColour,
	GitadoraSkillToColour,
	CalculateSDVXClass,
	SDVXVF6ToClass,
} from "./builtin-class-handlers";
import CreateLogCtx from "lib/logger/logger";
import { GITADORA_COLOURS, SDVX_VF_CLASSES } from "tachi-common";
import t from "tap";

const logger = CreateLogCtx(__filename);

t.test("#CalculateGitadoraColour", (t) => {
	t.strictSame(
		CalculateGitadoraColour("gitadora", "Gita", 1, { skill: 1500 }),
		{
			colour: GITADORA_COLOURS.ORANGE_GRADIENT,
		},
		"Should wrap the skill colour."
	);

	t.end();
});

t.test("#GitadoraSkillToColour", (t) => {
	t.equal(GitadoraSkillToColour(0), GITADORA_COLOURS.WHITE);
	t.equal(GitadoraSkillToColour(999), GITADORA_COLOURS.WHITE);
	t.equal(GitadoraSkillToColour(1000), GITADORA_COLOURS.ORANGE);
	t.equal(GitadoraSkillToColour(1500), GITADORA_COLOURS.ORANGE_GRADIENT);
	t.equal(GitadoraSkillToColour(2000), GITADORA_COLOURS.YELLOW);
	t.equal(GitadoraSkillToColour(2500), GITADORA_COLOURS.YELLOW_GRADIENT);
	t.equal(GitadoraSkillToColour(3000), GITADORA_COLOURS.GREEN);
	t.equal(GitadoraSkillToColour(3500), GITADORA_COLOURS.GREEN_GRADIENT);
	t.equal(GitadoraSkillToColour(4000), GITADORA_COLOURS.BLUE);
	t.equal(GitadoraSkillToColour(4500), GITADORA_COLOURS.BLUE_GRADIENT);
	t.equal(GitadoraSkillToColour(5000), GITADORA_COLOURS.PURPLE);
	t.equal(GitadoraSkillToColour(5500), GITADORA_COLOURS.PURPLE_GRADIENT);
	t.equal(GitadoraSkillToColour(6000), GITADORA_COLOURS.RED);
	t.equal(GitadoraSkillToColour(6500), GITADORA_COLOURS.RED_GRADIENT);
	t.equal(GitadoraSkillToColour(7000), GITADORA_COLOURS.BRONZE);
	t.equal(GitadoraSkillToColour(7500), GITADORA_COLOURS.SILVER);
	t.equal(GitadoraSkillToColour(8000), GITADORA_COLOURS.GOLD);
	t.equal(GitadoraSkillToColour(8500), GITADORA_COLOURS.RAINBOW);

	t.end();
});

t.test("#CalculateSDVXClass", (t) => {
	t.strictSame(CalculateSDVXClass("sdvx", "Single", 1, { VF6: 10 }, logger), {
		vfClass: SDVX_VF_CLASSES.COBALT_I,
	});

	t.end();
});

t.test("#SDVXVF6ToClass", (t) => {
	function f(vf: number) {
		return SDVXVF6ToClass(vf, logger);
	}

	t.equal(f(0), SDVX_VF_CLASSES.SIENNA_I);
	t.equal(f(2.5), SDVX_VF_CLASSES.SIENNA_II);
	t.equal(f(5), SDVX_VF_CLASSES.SIENNA_III);
	t.equal(f(7.5), SDVX_VF_CLASSES.SIENNA_IV);
	t.equal(f(10), SDVX_VF_CLASSES.COBALT_I);
	t.equal(f(10.5), SDVX_VF_CLASSES.COBALT_II);
	t.equal(f(11), SDVX_VF_CLASSES.COBALT_III);
	t.equal(f(11.5), SDVX_VF_CLASSES.COBALT_IV);
	t.equal(f(12), SDVX_VF_CLASSES.DANDELION_I);
	t.equal(f(12.5), SDVX_VF_CLASSES.DANDELION_II);
	t.equal(f(13), SDVX_VF_CLASSES.DANDELION_III);
	t.equal(f(13.5), SDVX_VF_CLASSES.DANDELION_IV);

	t.equal(f(14), SDVX_VF_CLASSES.CYAN_I);
	t.equal(f(14.25), SDVX_VF_CLASSES.CYAN_II);
	t.equal(f(14.5), SDVX_VF_CLASSES.CYAN_III);
	t.equal(f(14.75), SDVX_VF_CLASSES.CYAN_IV);
	t.equal(f(15), SDVX_VF_CLASSES.SCARLET_I);
	t.equal(f(15.25), SDVX_VF_CLASSES.SCARLET_II);
	t.equal(f(15.5), SDVX_VF_CLASSES.SCARLET_III);
	t.equal(f(15.75), SDVX_VF_CLASSES.SCARLET_IV);
	t.equal(f(16), SDVX_VF_CLASSES.CORAL_I);
	t.equal(f(16.25), SDVX_VF_CLASSES.CORAL_II);
	t.equal(f(16.5), SDVX_VF_CLASSES.CORAL_III);
	t.equal(f(16.75), SDVX_VF_CLASSES.CORAL_IV);
	t.equal(f(17), SDVX_VF_CLASSES.ARGENTO_I);
	t.equal(f(17.25), SDVX_VF_CLASSES.ARGENTO_II);
	t.equal(f(17.5), SDVX_VF_CLASSES.ARGENTO_III);
	t.equal(f(17.75), SDVX_VF_CLASSES.ARGENTO_IV);
	t.equal(f(18), SDVX_VF_CLASSES.ELDORA_I);
	t.equal(f(18.25), SDVX_VF_CLASSES.ELDORA_II);
	t.equal(f(18.5), SDVX_VF_CLASSES.ELDORA_III);
	t.equal(f(18.75), SDVX_VF_CLASSES.ELDORA_IV);
	t.equal(f(19), SDVX_VF_CLASSES.CRIMSON_I);
	t.equal(f(19.25), SDVX_VF_CLASSES.CRIMSON_II);
	t.equal(f(19.5), SDVX_VF_CLASSES.CRIMSON_III);
	t.equal(f(19.75), SDVX_VF_CLASSES.CRIMSON_IV);

	t.equal(f(20), SDVX_VF_CLASSES.IMPERIAL_I);
	t.equal(f(21), SDVX_VF_CLASSES.IMPERIAL_II);
	t.equal(f(22), SDVX_VF_CLASSES.IMPERIAL_III);
	t.equal(f(23), SDVX_VF_CLASSES.IMPERIAL_IV);
	t.equal(f(24), SDVX_VF_CLASSES.IMPERIAL_IV);
	t.equal(f(1000), SDVX_VF_CLASSES.IMPERIAL_IV);

	t.end();
});
