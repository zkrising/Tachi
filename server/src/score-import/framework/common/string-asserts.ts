import { InvalidScoreFailure } from "../score-importing/converter-failures";
import { Difficulties, Game, IDStrings, Playtypes } from "kamaitachi-common";
import { validDifficulties } from "kamaitachi-common/js/config";

export function AssertStrAsDifficulty(
    strVal: string,
    game: Game,
    playtype: Playtypes[Game]
): Difficulties[IDStrings] {
    if (!validDifficulties[game].includes(strVal)) {
        throw new InvalidScoreFailure(
            `Invalid Difficulty for ${game} ${playtype} - Expected any of ${validDifficulties[
                game
            ].join(", ")}`
        );
    }

    return strVal as Difficulties[IDStrings];
}

const isIntegerRegex = /^-?\d+$/u;

export function AssertStrAsPositiveInt(strVal: string, errorMessage: string) {
    let isInt = isIntegerRegex.test(strVal);

    if (!isInt) {
        throw new InvalidScoreFailure(`${errorMessage} (Not an integer.)`);
    }

    let val = Number(strVal);

    if (!Number.isSafeInteger(val)) {
        throw new InvalidScoreFailure(`${errorMessage} (Not an integer.)`);
    } else if (val < 0) {
        throw new InvalidScoreFailure(`${errorMessage} (Was negative.)`);
    }

    return val;
}

export function AssertStrAsPositiveNonZeroInt(strVal: string, errorMessage: string) {
    let isInt = isIntegerRegex.test(strVal);

    if (!isInt) {
        throw new InvalidScoreFailure(`${errorMessage} (Not an integer.)`);
    }

    let val = Number(strVal);

    if (!Number.isSafeInteger(val)) {
        throw new InvalidScoreFailure(`${errorMessage} (Not an integer.)`);
    } else if (val <= 0) {
        throw new InvalidScoreFailure(`${errorMessage} (Was negative or zero.)`);
    }

    return val;
}
