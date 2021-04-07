import { Game, Playtypes, ChartDocument } from "./types";
declare function humaniseGame<T extends Game>(game: T, pt?: Playtypes[T]): string;
interface ColourStuff {
    [index: string]: {
        outline: Record<string, string>;
        fill?: Record<string, string>;
    };
}
declare function GetGrade(game: Game, percent: number): string | null;
declare function ChangeAlpha(string: string, alpha: string): string;
declare function DirectScoreGradeDelta(game: Game, score: number, percent: number, chart: ChartDocument, delta: number): SGDReturn | null;
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
declare const _default: {
    supportedGames: Game[];
    gameOrders: {
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
    internalServiceGames: Record<string, Game[]>;
    versionHuman: Record<Game, Record<string, string>>;
    grades: Record<Game, string[]>;
    lamps: Record<Game, string[]>;
    lampColours: ColourStuff;
    gradeColours: ColourStuff;
    serviceSupportedGames: Record<string, Game[]>;
    defaultPlaytype: Record<Game, "SP" | "DP" | "Single" | "9B" | "7K" | "14K" | "5K" | "Gita" | "Dora">;
    gameChartIndicators: {
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
    GetGrade: typeof GetGrade;
    gradeBoundaries: Record<Game, number[]>;
    gameHuman: Record<Game, string>;
    ratingParameters: {
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
    validPlaytypes: Record<Game, ("SP" | "DP" | "Single" | "9B" | "7K" | "14K" | "5K" | "Gita" | "Dora")[]>;
    ScoreGradeDelta: typeof ScoreGradeDelta;
    judgeColours: {
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
    gameColours: Record<Game, string>;
    validTierlistTiers: Record<Game, string[]>;
    clearLamp: Record<Game, string>;
    gameRelevantScoreBucket: Record<Game, "grade" | "lamp">;
    judgementWindows: {
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
    PercentToScore: typeof PercentToScore;
    ChangeAlpha: typeof ChangeAlpha;
    validDifficulties: Record<Game, string[]>;
    validHitData: Record<Game, string[]>;
    validHitMeta: Record<Game, string[]>;
    boundaryHCF: Record<Game, number>;
    gameSpecificCalc: Partial<Record<Game, Partial<Record<"SP" | "DP" | "Single" | "9B" | "7K" | "14K" | "5K" | "Gita" | "Dora", string[]>>>>;
    expChartScale: Record<Game, number>;
    FormatDifficulty: typeof FormatDifficulty;
    DirectScoreGradeDelta: typeof DirectScoreGradeDelta;
    gameSpecificCalcDescriptions: {
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
    defaultDifficulty: Record<Game, string>;
    gamePercentMax: {
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
    AbsoluteScoreGradeDelta: typeof AbsoluteScoreGradeDelta;
    validScoreMeta: Record<Game, Record<string, unknown>>;
    clearGrade: {
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
    defaultTable: Record<Game, string>;
    folderTables: Record<Game, string[]>;
    supportsESD: Record<Game, boolean>;
    humaniseGame: typeof humaniseGame;
};
export default _default;
