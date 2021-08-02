import { ClassInfo, GameClassSets } from "../game-classes";
import { ESDJudgementFormat } from "../lib/esd";
import { Playtypes, Game, Difficulties, IDStrings, ScoreCalculatedDataLookup, SessionCalculatedDataLookup, UGSRatingsLookup, Grades, Lamps, JudgementLookup } from "../types";
export interface GameConfig<G extends Game = Game> {
    internalName: string;
    name: string;
    defaultPlaytype: Playtypes[G];
    validPlaytypes: Playtypes[G][];
}
interface BaseGamePTConfig<I extends IDStrings> {
    idString: I;
    percentMax: number;
    defaultScoreRatingAlg: ScoreCalculatedDataLookup[I];
    defaultSessionRatingAlg: SessionCalculatedDataLookup[I];
    defaultProfileRatingAlg: UGSRatingsLookup[I];
    scoreRatingAlgs: ScoreCalculatedDataLookup[I][];
    sessionRatingAlgs: SessionCalculatedDataLookup[I][];
    profileRatingAlgs: UGSRatingsLookup[I][];
    difficulties: Difficulties[I][];
    shortDifficulties: Partial<Record<Difficulties[I], string>>;
    defaultDifficulty: Difficulties[I];
    difficultyColours: Record<Difficulties[I], string | null>;
    grades: Grades[I][];
    gradeColours: Record<Grades[I], string>;
    clearGrade: Grades[I];
    gradeBoundaries: number[];
    lamps: Lamps[I][];
    lampColours: Record<Lamps[I], string>;
    clearLamp: Lamps[I];
    supportedClasses: GameClassSets[I][];
    classHumanisedFormat: Record<GameClassSets[I], ClassInfo[]>;
    judgements: JudgementLookup[I][];
    defaultTable: string;
    scoreBucket: "grade" | "lamp";
}
interface GamePTConfigWithESD<I extends IDStrings> extends BaseGamePTConfig<I> {
    supportsESD: true;
    judgementWindows: ESDJudgementFormat[];
}
interface GamePTConfigWithoutESD<I extends IDStrings> extends BaseGamePTConfig<I> {
    supportsESD: false;
}
export declare type GamePTConfig<I extends IDStrings = IDStrings> = GamePTConfigWithESD<I> | GamePTConfigWithoutESD<I>;
/**
 * A collection of CSS colours we want to work with.
 */
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
/**
 * Returns the configuration for this game.
 */
export declare function GetGameConfig<G extends Game>(game: G): GameConfig<G>;
/**
 * Returns the configuration for this Game + Playtype.
 * Optionally, a generic parameter - IDStrings - can be passed
 * to indicate what IDString this configuration is for.
 */
export declare function GetGamePTConfig<I extends IDStrings = IDStrings>(game: Game, playtype: Playtypes[Game]): GamePTConfig<I>;
export {};
