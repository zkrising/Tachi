/**
 * Common stuff for that all games might want to inherit.
 */

import type { ScoreMetric } from "../../types/metrics";

/**
 * A lot of games have a concept of timing windows and "missing". This means that
 * fast/slow and maxCombo are a given for almost every rhythm game.
 *
 * @note Additional metrics are *OPTIONAL!*. Your game might not implement fast/slow
 * or maxCombo, but if they conceptually have the idea of fast/slow or maxCombo, the
 * metrics should exist anyway. Why not. it's nice.
 *
 * There are a couple edge cases where this might not apply. For example, if a game has
 * no timing windows, it can't really have a concept of "fast" or "slow".
 *
 * I can't think of a realistic case where a game might not have a concept of "maxCombo"
 * as that necessitates that you either can't miss, or can't hit.
 */
export const DEFAULT_ADDITIONAL_METRICS = {
	fast: { type: "INTEGER" },
	slow: { type: "INTEGER" },
	maxCombo: { type: "INTEGER" },
} as const satisfies Record<string, ScoreMetric>;
