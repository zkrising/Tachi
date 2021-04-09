export interface ESDJudgementFormat {
    name: string;
    msBorder: number;
    value: number;
}
/**
 * Given judgements and a percent, estimate the standard deviation needed to get a score
 * with that percent.
 * @param judgements - The judgements for this game.
 * @param percent - The percent to estimate SD needed to get.
 * @param errOnInaccuracy - Whether or whether not to throw if the estimate is not accurate enough.
 * @returns
 */
export declare function CalculateESD(judgements: ESDJudgementFormat[], percent: number, errOnInaccuracy?: boolean): number;
/**
 * Compares two ESD values such that 1->2 produces a larger value than 101->102.
 * @param baseESD - The first ESD to compare.
 * @param compareESD - The second ESD to compare.
 * @param cdeg - The degrees of confidence to use. This should be 1.
 * @returns A number between -100 and 100.
 */
export declare function ESDCompare(baseESD: number, compareESD: number, cdeg?: number): number;
/**
 * Converts two percents to ESD, then runs ESDCompare.
 */
export declare function PercentCompare(judgements: ESDJudgementFormat[], baseP: number, compareP: number, cdeg?: number): number;
