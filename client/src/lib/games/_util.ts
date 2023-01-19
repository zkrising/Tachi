import { GPTRatingSystem } from "lib/types";
import { CSSProperties } from "react";
import { GPTString } from "tachi-common";

export function CreateRatingSys<GPT extends GPTString>(
	name: string,
	description: string,
	toNumber: GPTRatingSystem<GPT>["toNumber"],
	toString: GPTRatingSystem<GPT>["toString"],
	idvDifference: GPTRatingSystem<GPT>["idvDifference"] = () => false
): GPTRatingSystem<GPT> {
	return {
		description,
		name,
		toNumber,
		toString,
		idvDifference,
	};
}

export function bg(bgColour: string): CSSProperties {
	return { backgroundColor: bgColour };
}

export function bgc(bgColour: string, colour: string): CSSProperties {
	return { backgroundColor: bgColour, color: colour };
}
