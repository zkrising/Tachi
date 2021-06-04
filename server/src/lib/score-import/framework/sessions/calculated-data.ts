import { ScoreDocument, SessionDocument, Game, Playtypes } from "kamaitachi-common";

type ScoreCalculatedDataOnly = Pick<ScoreDocument, "calculatedData">;

const RELEVANT_SCORES = 10;

function AverageBest10(vals: (number | null | undefined)[]) {
    const numbers = vals.filter((e) => typeof e === "number") as number[];

    if (numbers.length < RELEVANT_SCORES) {
        return null;
    }

    return (
        numbers
            .sort((a, b) => b - a)
            .slice(0, RELEVANT_SCORES)
            .reduce((a, r) => a + r, 0) / RELEVANT_SCORES
    );
}

function SumAll(arr: ScoreCalculatedDataOnly[], prop: keyof ScoreDocument["calculatedData"]) {
    return arr.reduce((a, r) => {
        if (typeof r.calculatedData[prop] === "number") {
            return a + (r.calculatedData[prop] as number);
        }

        return a;
    }, 0);
}

function AvgBest10Map(arr: ScoreCalculatedDataOnly[], prop: keyof ScoreDocument["calculatedData"]) {
    return AverageBest10(arr.map((e) => e.calculatedData[prop]));
}

type CalculatedDataFunctions = {
    [G in Game]: {
        [P in Playtypes[G]]: (
            scoreCalcData: ScoreCalculatedDataOnly[]
        ) => SessionDocument["calculatedData"];
    };
};

const CalculatedDataFunctions: CalculatedDataFunctions = {
    iidx: {
        SP: (scd) => ({
            BPI: AvgBest10Map(scd, "BPI"),
            ktRating: AvgBest10Map(scd, "ktRating"),
            ktLampRating: AvgBest10Map(scd, "ktLampRating"),
        }),
        DP: (scd) => ({
            BPI: AvgBest10Map(scd, "BPI"),
            ktRating: AvgBest10Map(scd, "ktRating"),
            ktLampRating: AvgBest10Map(scd, "ktLampRating"),
        }),
    },
    sdvx: {
        Single: (scd) => {
            const VF6 = AvgBest10Map(scd, "VF6");

            return {
                VF6,
                profileVF6: VF6 === null ? null : VF6 * 50,
            };
        },
    },
    popn: {
        "9B": () => ({}),
    },
    museca: {
        Single: (scd) => ({
            ktRating: AvgBest10Map(scd, "ktRating"),
        }),
    },
    chunithm: {
        Single: (scd) => ({
            rating: AvgBest10Map(scd, "rating"),
        }),
    },
    maimai: {
        Single: (scd) => ({
            ktRating: AvgBest10Map(scd, "ktRating"),
        }),
    },
    gitadora: {
        Gita: (scd) => ({
            skill: AvgBest10Map(scd, "skill"),
        }),
        Dora: (scd) => ({
            skill: AvgBest10Map(scd, "skill"),
        }),
    },
    bms: {
        "7K": (scd) => ({
            ktLampRating: AvgBest10Map(scd, "ktLampRating"),
        }),
        "14K": (scd) => ({
            ktLampRating: AvgBest10Map(scd, "ktLampRating"),
        }),
    },
    ddr: {
        SP: (scd) => ({
            MFCP: SumAll(scd, "MFCP"),
            ktRating: AvgBest10Map(scd, "ktRating"),
        }),
        DP: (scd) => ({
            MFCP: SumAll(scd, "MFCP"),
            ktRating: AvgBest10Map(scd, "ktRating"),
        }),
    },
    jubeat: {
        Single: (scd) => ({
            jubility: AvgBest10Map(scd, "jubility"),
        }),
    },
    usc: {
        Single: (scd) => {
            const VF6 = AvgBest10Map(scd, "VF6");

            return {
                VF6,
                profileVF6: VF6 === null ? null : VF6 * 50,
            };
        },
    },
};

export function CreateSessionCalcData(
    game: Game,
    playtype: Playtypes[Game],
    scoreCalcData: ScoreCalculatedDataOnly[]
): SessionDocument["calculatedData"] {
    // @ts-expect-error standard game->pt stuff.
    return CalculatedDataFunctions[game][playtype](scoreCalcData);
}
