import { Game, Playtypes, ChartDocument } from "./types";
declare function humaniseGame<T extends Game>(game: T, pt?: Playtypes[T]): string;
interface ColourStuff {
    [index: string]: {
        outline: Record<string, string>;
        fill?: Record<string, string>;
    };
}
declare function GetLevel(xp: number): number;
declare function GetXPForLevel(level: number): number;
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
    folders: {
        iidx: {
            type: string;
            levels: string[];
            versions: string[];
        };
        museca: {
            type: string;
            levels: string[];
            versions: string[];
        };
        maimai: {
            type: string;
            levels: string[];
            versions: string[];
        };
        jubeat: {
            type: string;
            levels: string[];
            versions: string[];
        };
        popn: {
            type: string;
            levels: string[];
            versions: string[];
        };
        ddr: {
            type: string;
            levels: string[];
            versions: string[];
        };
        sdvx: {
            type: string;
            levels: string[];
            versions: string[];
        };
        bms: {
            type: string;
            reasonableLevelMax: number;
            levels: never[];
            versions: never[];
        };
        chunithm: {
            type: string;
            levels: string[];
            versions: string[];
        };
        gitadora: {
            type: string;
            levels: never[];
            versions: string[];
            reasonableLevelMax: number;
        };
        usc: {
            type: string;
            levels: never[];
            versions: string[];
        };
    };
    internalServiceGames: Record<string, Game[]>;
    versionHuman: Record<Game, Record<string, string>>;
    grades: Record<Game, string[]>;
    lamps: Record<Game, string[]>;
    lampColours: ColourStuff;
    gradeColours: ColourStuff;
    GetLevel: typeof GetLevel;
    GetXPForLevel: typeof GetXPForLevel;
    serviceSupportedGames: Record<string, Game[]>;
    defaultPlaytype: Record<Game, "SP" | "DP" | "9B" | "Single" | "7K" | "14K" | "5K" | "Gita" | "Dora">;
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
    validPlaytypes: Record<Game, ("SP" | "DP" | "9B" | "Single" | "7K" | "14K" | "5K" | "Gita" | "Dora")[]>;
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
    validModifiers: {
        iidx: {
            note: string[];
            gauge: string[];
        };
        bms: {
            note: string[];
            gauge: string[];
        };
        ddr: {
            speed: string[];
        };
    };
    adviceChartTags: {
        iidx: string[];
        bms: string[];
        ddr: string[];
        museca: string[];
        sdvx: string[];
        popn: string[];
        jubeat: string[];
        maimai: string[];
        chunithm: string[];
        gitadora: string[];
        usc: string[];
    };
    adviceNoteTags: {
        iidx: string[];
        bms: string[];
        ddr: string[];
        museca: string[];
        sdvx: string[];
        usc: string[];
        popn: never[];
        jubeat: never[];
        maimai: never[];
        chunithm: never[];
        gitadora: never[];
    };
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
    validAltScores: Record<Game, string[]>;
    levels: {
        iidx: string[];
        museca: string[];
        popn: string[];
        ddr: string[];
        sdvx: string[];
        jubeat: string[];
        maimai: string[];
        bms: never[];
        chunithm: string[];
        gitadora: never[];
        usc: string[];
    };
    boundaryHCF: Record<Game, number>;
    gameSpecificCalc: Partial<Record<Game, Partial<Record<"SP" | "DP" | "9B" | "Single" | "7K" | "14K" | "5K" | "Gita" | "Dora", string[]>>>>;
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
    difficultyShorthand: Record<Game, Partial<Record<"BEGINNER" | "NORMAL" | "HYPER" | "ANOTHER" | "LEGGENDARIA" | "Green" | "Yellow" | "Red" | "Easy" | "Basic" | "Advanced" | "Expert" | "Master" | "Re:Master" | "BSC" | "ADV" | "EXT" | "Normal" | "Hyper" | "EX" | "NOV" | "EXH" | "MXM" | "INF" | "GRV" | "HVN" | "VVD" | "BASIC" | "DIFFICULT" | "EXPERT" | "CHALLENGE" | "INSANE" | "CUSTOM" | "ADVANCED" | "MASTER" | "WORLD'S END" | "EXTREME" | "BASS BASIC" | "BASS ADVANCED" | "BASS EXTREME" | "BASS MASTER", string>>>;
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
    defaultGameClasses: {
        iidx: {
            SP: string;
            DP: string;
        };
        ddr: {
            SP: string;
            DP: string;
        };
        gitadora: {
            Gita: string;
            Dora: string;
        };
        popn: {};
        sdvx: {
            Single: string;
        };
        museca: {};
        jubeat: {
            Single: string;
        };
        bms: {
            "7K": string;
        };
        chunithm: {};
        maimai: {};
        usc: {};
    };
    gameClassValues: {
        iidx: {
            SP: {
                dan: {
                    kaiden: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    chuuden: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    10: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    9: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    8: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    7: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    6: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    5: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    4: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    3: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    2: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    1: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    "1kyu": {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    "2kyu": {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    "3kyu": {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    "4kyu": {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    "5kyu": {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    "6kyu": {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    "7kyu": {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                };
            };
            DP: {
                dan: {
                    kaiden: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    chuuden: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    10: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    9: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    8: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    7: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    6: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    5: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    4: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    3: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    2: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    1: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    "1kyu": {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    "2kyu": {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    "3kyu": {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    "4kyu": {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    "5kyu": {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    "6kyu": {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    "7kyu": {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                };
            };
        };
        ddr: {
            SP: {
                dan: {};
            };
            DP: {
                dan: {};
            };
        };
        sdvx: {
            Single: {
                dan: {
                    inf: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    11: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    10: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    9: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    8: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    7: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    6: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    5: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    4: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    3: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    2: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                    1: {
                        display: string;
                        mouseover: string;
                        index: number;
                    };
                };
            };
        };
        popn: {};
        museca: {};
        jubeat: {};
        bms: {
            "7K": {
                genocideDan: {
                    overjoy: {
                        display: string;
                        mouseover: string;
                    };
                    kaiden: {
                        display: string;
                        mouseover: string;
                    };
                    10: {
                        display: string;
                        mouseover: string;
                    };
                    9: {
                        display: string;
                        mouseover: string;
                    };
                    8: {
                        display: string;
                        mouseover: string;
                    };
                    7: {
                        display: string;
                        mouseover: string;
                    };
                    6: {
                        display: string;
                        mouseover: string;
                    };
                    5: {
                        display: string;
                        mouseover: string;
                    };
                    4: {
                        display: string;
                        mouseover: string;
                    };
                    3: {
                        display: string;
                        mouseover: string;
                    };
                    2: {
                        display: string;
                        mouseover: string;
                    };
                    1: {
                        display: string;
                        mouseover: string;
                    };
                };
                stDan: {
                    st11: {
                        display: string;
                        mouseover: string;
                    };
                    st10: {
                        display: string;
                        mouseover: string;
                    };
                    st9: {
                        display: string;
                        mouseover: string;
                    };
                    st8: {
                        display: string;
                        mouseover: string;
                    };
                    st7: {
                        display: string;
                        mouseover: string;
                    };
                    st6: {
                        display: string;
                        mouseover: string;
                    };
                    st5: {
                        display: string;
                        mouseover: string;
                    };
                    st4: {
                        display: string;
                        mouseover: string;
                    };
                    st3: {
                        display: string;
                        mouseover: string;
                    };
                    st2: {
                        display: string;
                        mouseover: string;
                    };
                    st1: {
                        display: string;
                        mouseover: string;
                    };
                    st0: {
                        display: string;
                        mouseover: string;
                    };
                    sl12: {
                        display: string;
                        mouseover: string;
                    };
                    sl11: {
                        display: string;
                        mouseover: string;
                    };
                    sl10: {
                        display: string;
                        mouseover: string;
                    };
                    sl9: {
                        display: string;
                        mouseover: string;
                    };
                    sl8: {
                        display: string;
                        mouseover: string;
                    };
                    sl7: {
                        display: string;
                        mouseover: string;
                    };
                    sl6: {
                        display: string;
                        mouseover: string;
                    };
                    sl5: {
                        display: string;
                        mouseover: string;
                    };
                    sl4: {
                        display: string;
                        mouseover: string;
                    };
                    sl3: {
                        display: string;
                        mouseover: string;
                    };
                    sl2: {
                        display: string;
                        mouseover: string;
                    };
                    sl1: {
                        display: string;
                        mouseover: string;
                    };
                    sl0: {
                        display: string;
                        mouseover: string;
                    };
                };
            };
        };
        chunithm: {};
        gitadora: {
            Gita: {
                skillColour: {
                    rainbow: {
                        display: string;
                        mouseover: string;
                    };
                    gold: {
                        display: string;
                        mouseover: string;
                    };
                    silver: {
                        display: string;
                        mouseover: string;
                    };
                    bronze: {
                        display: string;
                        mouseover: string;
                    };
                    redgradient: {
                        display: string;
                        mouseover: string;
                    };
                    red: {
                        display: string;
                        mouseover: string;
                    };
                    purplegradient: {
                        display: string;
                        mouseover: string;
                    };
                    purple: {
                        display: string;
                        mouseover: string;
                    };
                    bluegradient: {
                        display: string;
                        mouseover: string;
                    };
                    blue: {
                        display: string;
                        mouseover: string;
                    };
                    greengradient: {
                        display: string;
                        mouseover: string;
                    };
                    green: {
                        display: string;
                        mouseover: string;
                    };
                    yellowgradient: {
                        display: string;
                        mouseover: string;
                    };
                    yellow: {
                        display: string;
                        mouseover: string;
                    };
                    orangegradient: {
                        display: string;
                        mouseover: string;
                    };
                    orange: {
                        display: string;
                        mouseover: string;
                    };
                    white: {
                        display: string;
                        mouseover: string;
                    };
                };
            };
            Dora: {
                skillColour: {
                    rainbow: {
                        display: string;
                        mouseover: string;
                    };
                    gold: {
                        display: string;
                        mouseover: string;
                    };
                    silver: {
                        display: string;
                        mouseover: string;
                    };
                    bronze: {
                        display: string;
                        mouseover: string;
                    };
                    redgradient: {
                        display: string;
                        mouseover: string;
                    };
                    red: {
                        display: string;
                        mouseover: string;
                    };
                    purplegradient: {
                        display: string;
                        mouseover: string;
                    };
                    purple: {
                        display: string;
                        mouseover: string;
                    };
                    bluegradient: {
                        display: string;
                        mouseover: string;
                    };
                    blue: {
                        display: string;
                        mouseover: string;
                    };
                    greengradient: {
                        display: string;
                        mouseover: string;
                    };
                    green: {
                        display: string;
                        mouseover: string;
                    };
                    yellowgradient: {
                        display: string;
                        mouseover: string;
                    };
                    yellow: {
                        display: string;
                        mouseover: string;
                    };
                    orangegradient: {
                        display: string;
                        mouseover: string;
                    };
                    orange: {
                        display: string;
                        mouseover: string;
                    };
                    white: {
                        display: string;
                        mouseover: string;
                    };
                };
            };
        };
        maimai: {};
        usc: {};
    };
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
