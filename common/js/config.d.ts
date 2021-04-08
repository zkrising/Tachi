import { Game, Playtypes, ChartDocument } from "./types";
declare const supportedGames: Game[];
declare const gameSpecificCalc: Partial<Record<Game, Partial<Record<Playtypes[Game], string[]>>>>;
declare const gameSpecificCalcDescriptions: {
    iidx: {
        SP: {
            BPI: string;
            "K%": string;
        };
        DP: {
            BPI: string;
        };
    };
    sdvx: {
        Single: {
            VF4: string;
            VF5: string;
        };
    };
    ddr: {
        SP: {
            MFCP: string;
        };
        DP: {
            MFCP: string;
        };
    };
    usc: {
        Single: {
            VF4: string;
            VF5: string;
        };
    };
};
declare const validDifficulties: Record<Game, string[]>;
declare const defaultTable: Record<Game, string>;
declare const folderTables: Record<Game, string[]>;
declare const validHitData: Record<Game, string[]>;
declare const validHitMeta: Record<Game, string[]>;
declare const validScoreMeta: Record<Game, Record<string, unknown>>;
declare const gameColours: Record<Game, string>;
declare const gameRelevantScoreBucket: Record<Game, "grade" | "lamp">;
declare const gameHuman: Record<Game, string>;
declare const versionHuman: Record<Game, Record<string, string>>;
declare const gameOrders: {
    iidx: string[];
    museca: string[];
    maimai: string[];
    jubeat: string[];
    popn: string[];
    sdvx: string[];
    ddr: string[];
    bms: string[];
    chunithm: string[];
    gitadora: string[];
    usc: string[];
};
declare const defaultPlaytype: Record<Game, Playtypes[Game]>;
declare const defaultDifficulty: Record<Game, string>;
declare function humaniseGame<T extends Game>(game: T, pt?: Playtypes[T]): string;
declare const validPlaytypes: Record<Game, Playtypes[Game][]>;
declare const grades: Record<Game, string[]>;
declare const gradeBoundaries: Record<Game, number[]>;
declare const boundaryHCF: Record<Game, number>;
declare const expChartScale: Record<Game, number>;
declare const lamps: Record<Game, string[]>;
declare const clearLamp: Record<Game, string>;
declare const clearGrade: {
    iidx: string;
    bms: string;
    museca: string;
    maimai: string;
    jubeat: string;
    popn: string;
    sdvx: string;
    ddr: string;
    chunithm: string;
    gitadora: string;
    usc: string;
};
declare const judgementWindows: {
    iidx: {
        SP: {
            name: string;
            msBorder: number;
            value: number;
        }[];
        DP: {
            name: string;
            msBorder: number;
            value: number;
        }[];
    };
    ddr: {
        SP: {
            name: string;
            msBorder: number;
            value: number;
        }[];
        DP: {
            name: string;
            msBorder: number;
            value: number;
        }[];
    };
    museca: {
        Single: {
            name: string;
            msBorder: number;
            value: number;
        }[];
    };
    gitadora: {
        Gita: {
            name: string;
            msBorder: number;
            value: number;
        }[];
        Dora: {
            name: string;
            msBorder: number;
            value: number;
        }[];
    };
};
interface ColourStuff {
    [index: string]: {
        outline: Record<string, string>;
        fill?: Record<string, string>;
    };
}
declare const gradeColours: ColourStuff;
declare const lampColours: ColourStuff;
declare const judgeColours: {
    iidx: {
        fill: {
            MISS: string;
            BAD: string;
            GOOD: string;
            GREAT: string;
            PGREAT: string;
        };
        outline: {
            MISS: string;
            BAD: string;
            GOOD: string;
            GREAT: string;
            PGREAT: string;
        };
    };
    bms: {
        fill: {
            MISS: string;
            BAD: string;
            GOOD: string;
            GREAT: string;
            PGREAT: string;
        };
        outline: {
            MISS: string;
            BAD: string;
            GOOD: string;
            GREAT: string;
            PGREAT: string;
        };
    };
    ddr: {
        fill: {
            MISS: string;
            BOO: string;
            GOOD: string;
            GREAT: string;
            PERFECT: string;
            MARVELOUS: string;
        };
        outline: {
            MISS: string;
            BOO: string;
            GOOD: string;
            GREAT: string;
            PERFECT: string;
            MARVELOUS: string;
        };
    };
    museca: {
        fill: {
            MISS: string;
            NEAR: string;
            CRITICAL: string;
        };
        outline: {
            MISS: string;
            NEAR: string;
            CRITICAL: string;
        };
    };
    sdvx: {
        fill: {
            MISS: string;
            NEAR: string;
            CRITICAL: string;
        };
        outline: {
            MISS: string;
            NEAR: string;
            CRITICAL: string;
        };
    };
    usc: {
        fill: {
            MISS: string;
            NEAR: string;
            CRITICAL: string;
        };
        outline: {
            MISS: string;
            NEAR: string;
            CRITICAL: string;
        };
    };
    popn: {
        fill: {
            BAD: string;
            GOOD: string;
            GREAT: string;
            PGREAT: string;
        };
        outline: {
            BAD: string;
            GOOD: string;
            GREAT: string;
            PGREAT: string;
        };
    };
    maimai: {
        fill: {
            MISS: string;
            GOOD: string;
            GREAT: string;
            PERFECT: string;
        };
        outline: {
            MISS: string;
            GOOD: string;
            GREAT: string;
            PERFECT: string;
        };
    };
    jubeat: {
        fill: {
            MISS: string;
            POOR: string;
            GOOD: string;
            GREAT: string;
            PERFECT: string;
        };
        outline: {
            MISS: string;
            POOR: string;
            GOOD: string;
            GREAT: string;
            PERFECT: string;
        };
    };
    chunithm: {
        outline: {
            MISS: string;
            ATTACK: string;
            JUSTICE: string;
            JCRIT: string;
        };
        fill: {
            MISS: string;
            ATTACK: string;
            JUSTICE: string;
            JCRIT: string;
        };
    };
    gitadora: {
        outline: {
            MISS: string;
            OK: string;
            GOOD: string;
            GREAT: string;
            PERFECT: string;
        };
        fill: {
            MISS: string;
            OK: string;
            GOOD: string;
            GREAT: string;
            PERFECT: string;
        };
    };
};
declare const gameChartIndicators: {
    iidx: string[];
    popn: string[];
    ddr: string[];
    museca: never[];
    maimai: never[];
    jubeat: string[];
    sdvx: never[];
    usc: never[];
    bms: never[];
    chunithm: never[];
    gitadora: never[];
};
declare function GetGrade(game: Game, percent: number): string | null;
declare const ratingParameters: {
    iidx: {
        failHarshnessMultiplier: number;
        pivotPercent: number;
        clearExpMultiplier: number;
    };
    bms: {
        failHarshnessMultiplier: number;
        pivotPercent: number;
        clearExpMultiplier: number;
    };
    museca: {
        failHarshnessMultiplier: number;
        pivotPercent: number;
        clearExpMultiplier: number;
    };
    popn: {
        failHarshnessMultiplier: number;
        pivotPercent: number;
        clearExpMultiplier: number;
    };
    maimai: {
        failHarshnessMultiplier: number;
        pivotPercent: number;
        clearExpMultiplier: number;
    };
    jubeat: {
        failHarshnessMultiplier: number;
        pivotPercent: number;
        clearExpMultiplier: number;
    };
    sdvx: {
        failHarshnessMultiplier: number;
        pivotPercent: number;
        clearExpMultiplier: number;
    };
    usc: {
        failHarshnessMultiplier: number;
        pivotPercent: number;
        clearExpMultiplier: number;
    };
    ddr: {
        failHarshnessMultiplier: number;
        pivotPercent: number;
        clearExpMultiplier: number;
    };
    chunithm: {
        failHarshnessMultiplier: number;
        pivotPercent: number;
        clearExpMultiplier: number;
    };
    gitadora: {
        failHarshnessMultiplier: number;
        pivotPercent: number;
        clearExpMultiplier: number;
    };
};
declare function ChangeAlpha(string: string, alpha: string): string;
declare function DirectScoreGradeDelta(game: Game, score: number, percent: number, chart: ChartDocument, delta: number): SGDReturn | null;
declare const supportsESD: Record<Game, boolean>;
interface SGDReturn {
    grade: string;
    delta: number;
    formattedString: string;
}
interface PartialScore {
    scoreData: {
        score: number;
        grade: string;
    };
}
declare function ScoreGradeDelta(game: Game, score: PartialScore, chart: ChartDocument, delta: number): SGDReturn | null;
declare function AbsoluteScoreGradeDelta(game: Game, score: number, percent: number, absDelta: number): SGDReturn | null;
declare function PercentToScore(percent: number, game: Game, chartData: ChartDocument): number;
declare function FormatDifficulty(chart: ChartDocument, game: Game): string;
declare const gamePercentMax: {
    iidx: number;
    ddr: number;
    gitadora: number;
    popn: number;
    sdvx: number;
    museca: number;
    jubeat: number;
    bms: number;
    chunithm: number;
    maimai: number;
    maimaidx: number;
    usc: number;
};
export { supportedGames, gameOrders, versionHuman, grades, lamps, lampColours, gradeColours, defaultPlaytype, gameChartIndicators, GetGrade, gradeBoundaries, gameHuman, ratingParameters, validPlaytypes, ScoreGradeDelta, judgeColours, gameColours, clearLamp, gameRelevantScoreBucket, judgementWindows, PercentToScore, ChangeAlpha, validDifficulties, validHitData, validHitMeta, boundaryHCF, gameSpecificCalc, expChartScale, FormatDifficulty, DirectScoreGradeDelta, gameSpecificCalcDescriptions, defaultDifficulty, gamePercentMax, AbsoluteScoreGradeDelta, validScoreMeta, clearGrade, defaultTable, folderTables, supportsESD, humaniseGame, };
