import { AnyChartDocument, Game, Playtypes } from "..";
export declare function FormatDifficulty(chart: AnyChartDocument, game: Game): string;
/**
 * Formats a chart's difficulty into a shorter variant. This handles a lot of
 * game-specific strange edge cases.
 */
export declare function FormatDifficultyShort(chart: AnyChartDocument, game: Game): string;
export declare function FormatGame(game: Game, playtype: Playtypes[Game]): string;
