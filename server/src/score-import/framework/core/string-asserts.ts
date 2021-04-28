import { InvalidScoreFailure } from "./converter-failures";

const isIntegerRegex = /^-?\d+$/;

export function AssertStrAsPositiveInt(strVal: string, errorMessage: string) {
    let isInt = isIntegerRegex.test(strVal);

    if (!isInt) {
        throw new InvalidScoreFailure(`${errorMessage} (Not an integer.)`);
    }

    let val = Number(strVal);

    if (Number.isNaN(val)) {
        throw new InvalidScoreFailure(`${errorMessage} (Not a number.)`);
    } else if (!Number.isSafeInteger(val)) {
        throw new InvalidScoreFailure(`${errorMessage} (Not an integer.)`);
    } else if (val < 0) {
        throw new InvalidScoreFailure(`${errorMessage} (Was Negative).`);
    }

    return val;
}

export function AssertStrAsPositiveNonZeroInt(strVal: string, errorMessage: string) {
    let isInt = isIntegerRegex.test(strVal);

    if (!isInt) {
        throw new InvalidScoreFailure(`${errorMessage} (Not an integer.)`);
    }

    let val = Number(strVal);

    if (Number.isNaN(val)) {
        throw new InvalidScoreFailure(`${errorMessage} (Not a number.)`);
    } else if (!Number.isSafeInteger(val)) {
        throw new InvalidScoreFailure(`${errorMessage} (Not an integer.)`);
    } else if (val <= 0) {
        throw new InvalidScoreFailure(`${errorMessage} (Was Negative).`);
    }

    return val;
}
