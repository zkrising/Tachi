import t from "tap";
import { CalculateGitadoraColour, GitadoraSkillToColour } from "./builtin-class-handlers";

t.test("#CalculateGitadoraColour", (t) => {
    t.strictSame(
        CalculateGitadoraColour("gitadora", "Gita", 1, { skill: 1500 }),
        {
            skillColour: "orangegradient",
        },
        "Should wrap the skill colour."
    );

    t.end();
});

t.test("#GitadoraSkillToColour", (t) => {
    t.equal(GitadoraSkillToColour(0), "white");
    t.equal(GitadoraSkillToColour(999), "white");
    t.equal(GitadoraSkillToColour(1000), "orange");
    t.equal(GitadoraSkillToColour(1500), "orangegradient");
    t.equal(GitadoraSkillToColour(2000), "yellow");
    t.equal(GitadoraSkillToColour(2500), "yellowgradient");
    t.equal(GitadoraSkillToColour(3000), "green");
    t.equal(GitadoraSkillToColour(3500), "greengradient");
    t.equal(GitadoraSkillToColour(4000), "blue");
    t.equal(GitadoraSkillToColour(4500), "bluegradient");
    t.equal(GitadoraSkillToColour(5000), "purple");
    t.equal(GitadoraSkillToColour(5500), "purplegradient");
    t.equal(GitadoraSkillToColour(6000), "red");
    t.equal(GitadoraSkillToColour(6500), "redgradient");
    t.equal(GitadoraSkillToColour(7000), "bronze");
    t.equal(GitadoraSkillToColour(7500), "silver");
    t.equal(GitadoraSkillToColour(8000), "gold");
    t.equal(GitadoraSkillToColour(8500), "rainbow");

    t.end();
});
