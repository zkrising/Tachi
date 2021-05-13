import { Game, Playtypes, ImportTypes, FileUploadImportTypes, AnyChartDocument, IRImportTypes } from "./types";
export declare const fileImportTypes: FileUploadImportTypes[];
export declare const irImportTypes: IRImportTypes[];
export declare const importTypes: ImportTypes[];
export declare const supportedGames: Game[];
export declare const gameSpecificCalc: Partial<Record<Game, Partial<Record<Playtypes[Game], string[]>>>>;
export declare const gameSpecificCalcDescriptions: {
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
export declare const validDifficulties: Record<Game, string[]>;
export declare const defaultTable: Record<Game, string>;
export declare const folderTables: Record<Game, string[]>;
export declare const validHitData: Record<Game, string[]>;
export declare const gameColours: Record<Game, string>;
export declare const gameRelevantScoreBucket: Record<Game, "grade" | "lamp">;
export declare const gameHuman: Record<Game, string>;
export declare const versionHuman: Record<Game, Record<string, string>>;
export declare const gameOrders: {
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
export declare const defaultPlaytype: Record<Game, Playtypes[Game]>;
export declare const defaultDifficulty: Record<Game, string>;
export declare function humaniseGame<T extends Game>(game: T, pt?: Playtypes[T]): string;
export declare const validPlaytypes: Record<Game, Playtypes[Game][]>;
export declare const grades: Record<Game, string[]>;
export declare const gradeBoundaries: Record<Game, number[]>;
export declare const boundaryHCF: Record<Game, number>;
export declare const expChartScale: Record<Game, number>;
export declare const lamps: Record<Game, string[]>;
export declare const clearLamp: Record<Game, string>;
export declare const clearGrade: {
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
export declare const judgementWindows: {
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
export declare const COLOUR_SET: {
    gray: string;
    maroon: string;
    red: string;
    paleGreen: string;
    paleBlue: string;
    green: string;
    blue: string;
    gold: string;
    vibrantYellow: string;
    teal: string;
    white: string;
    purple: string;
    vibrantPurple: string;
    paleOrange: string;
    orange: string;
    vibrantOrange: string;
    vibrantBlue: string;
    vibrantGreen: string;
};
interface ColourStuff {
    [index: string]: {
        outline: Record<string, string>;
        fill?: Record<string, string>;
    };
}
export declare const gradeColours: ColourStuff;
export declare const lampColours: ColourStuff;
export declare const judgeColours: {
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
export declare const gameChartIndicators: {
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
export declare const ratingParameters: {
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
export declare function DirectScoreGradeDelta(game: Game, score: number, percent: number, chart: AnyChartDocument, delta: number): SGDReturn | null;
export declare const supportsESD: Record<Game, boolean>;
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
export declare function ScoreGradeDelta(game: Game, score: PartialScore, chart: AnyChartDocument, delta: number): SGDReturn | null;
export declare function AbsoluteScoreGradeDelta(game: Game, score: number, percent: number, absDelta: number): SGDReturn | null;
export declare function CalculateScore(game: Game, percent: number, chart: AnyChartDocument): number | null;
export declare function PercentToScore(percent: number, game: Game, chartData: AnyChartDocument): number;
export declare function FormatDifficulty(chart: AnyChartDocument, game: Game): string;
export declare const gamePercentMax: {
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
export {};
