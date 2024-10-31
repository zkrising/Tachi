import { GPTRatingSystem } from "lib/types";
import { CSSProperties } from "react";
import { GPTString } from "tachi-common";

export function CreateRatingSys<GPT extends GPTString>(
	name: string,
	description: string,
	enumName: string,
	toNumber: GPTRatingSystem<GPT>["toNumber"],
	toString: GPTRatingSystem<GPT>["toString"],
	idvDifference: GPTRatingSystem<GPT>["idvDifference"] = () => false,
	achievementFn: GPTRatingSystem<GPT>["achievementFn"] = undefined
): GPTRatingSystem<GPT> {
	return {
		description,
		enumName,
		name,
		toNumber,
		toString,
		idvDifference,
		achievementFn,
	};
}

export function bg(bgColour: string): CSSProperties {
	return { backgroundColor: bgColour };
}

export function bgc(bgColour: string, colour: string): CSSProperties {
	return { backgroundColor: bgColour, color: colour };
}
