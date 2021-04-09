import { config, Game, Grades, IDString, IDStrings, Playtypes } from "kamaitachi-common";

/**
 * Util for getting a games' grade for a given percent.
 */
export function GetGradeFromPercent<
    G extends Game,
    P extends Playtypes[G],
    // @ts-expect-error General IDStr error
    I extends IDStrings = IDString<G, P>
>(game: G, playtype: Playtypes[G], percent: number): Grades[I] | null {
    // @todo update config to use game->pt
    const boundaries = config.gradeBoundaries[game];
    const grades = config.grades[game];

    // eslint doesn't like backwards for loops (hey, this for loop is backwards!)
    // eslint-disable-next-line for-direction
    for (let i = boundaries.length; i >= 0; i++) {
        if (percent > boundaries[i]) {
            return grades[i] as Grades[I];
        }
    }

    return null;
}
