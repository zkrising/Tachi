/**
 * Utilities *specifically* for game/gpt configuration.
 */
import type { integer } from "../types";
import type { ClassInfo } from "../types/_TEMPNAME-game-config-inner";

export function NoDecimalPlace(value: number): string {
	return value.toFixed(0);
}

/**
 * Mandate that this field formats to this amount of decimal places.
 */
export function ToDecimalPlaces(dp: integer) {
	return (v: number) => v.toFixed(dp);
}

/**
 * Define a value for a class set.
 *
 * @param id - The classes internal string ID.
 * @param display - What should be displayed to end users visually?
 * @param hoverText - If a user hovers over this badge, should it display any different
 * text? This is useful for things like IIDX Dans, where the expected display strings
 * are kanji.
 */
export function ClassValue(id: string, display: string, hoverText?: string): ClassInfo {
	return { id, display, hoverText };
}
