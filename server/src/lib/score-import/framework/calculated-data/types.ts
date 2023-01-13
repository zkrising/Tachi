import type { KtLogger } from "lib/logger/logger";
import type { ClassConfigs, Classes, GPTString, integer } from "tachi-common";
import type { DerivedClassConfig, ProvidedClassConfig } from "tachi-common/types/game-config-utils";

// type RecordClassProvider<GPT extends GPTString> = {
// 	[C in keyof ClassConfigs[GPT] as ClassConfigs[GPT][C] extends ProvidedClassConfig
// 		? C
// 		: never]: ClassConfigs[GPT][C] extends ProvidedClassConfig<infer V> ? V : never;
// };

// couldn't figure out how to get this typesafe, sorry.
type RecordClassProvider<GPT extends GPTString> = Record<Classes[GPT], string>;

export type ClassProvider<GPT extends GPTString = GPTString> = (
	gptString: GPT,
	userID: integer,
	ratings: Record<string, number | null>,
	logger: KtLogger
) => Partial<RecordClassProvider<GPT>> | Promise<Partial<RecordClassProvider<GPT>>> | undefined;
