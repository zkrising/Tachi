import { Game, Playtypes, integer } from "kamaitachi-common";

export function CalculateGitadoraColour(
    game: Game,
    playtype: Playtypes[Game],
    userID: integer,
    customRatings: Record<string, number>
): Record<string, string> {
    let skillColour = GitadoraSkillToColour(customRatings.skill);

    return {
        skillColour,
    };
}

function GitadoraSkillToColour(sk: number) {
    if (sk >= 8500) {
        return "rainbow";
    } else if (sk >= 8000) {
        return "gold";
    } else if (sk >= 7500) {
        return "silver";
    } else if (sk >= 7000) {
        return "bronze";
    } else if (sk >= 6500) {
        return "redgradient";
    } else if (sk >= 6000) {
        return "red";
    } else if (sk >= 5500) {
        return "purplegradient";
    } else if (sk >= 5000) {
        return "purple";
    } else if (sk >= 4500) {
        return "bluegradient";
    } else if (sk >= 4000) {
        return "blue";
    } else if (sk >= 3500) {
        return "greengradient";
    } else if (sk >= 3000) {
        return "green";
    } else if (sk >= 2500) {
        return "yellowgradient";
    } else if (sk > 2000) {
        return "yellow";
    } else if (sk > 1500) {
        return "orangegradient";
    } else if (sk > 1000) {
        return "orange";
    }

    return "white";
}

export function CalculateJubeatColour(
    game: Game,
    playtype: Playtypes[Game],
    userID: integer,
    customRatings: Record<string, number>
): Promise<Record<string, string>> {
    throw new Error("Not implemented.");
}

function JubilityToColour(jb: number) {}
