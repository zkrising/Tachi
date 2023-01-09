import type { KtLogger } from "lib/logger/logger";
import type { ClassConfigs, GPTString, integer } from "tachi-common";
import type { DerivedClassConfig, ProvidedClassConfig } from "tachi-common/types/game-config-utils";

type RecordClassProvider<GPT extends GPTString> = {
	[C in keyof ClassConfigs[GPT] as ClassConfigs[GPT][C] extends DerivedClassConfig
		? C
		: never]: ClassConfigs[GPT][C] extends ProvidedClassConfig<infer V> ? V : never;
};

export type ClassProvider<GPT extends GPTString = GPTString> = (
	gptString: GPT,
	userID: integer,
	ratings: Record<string, number | null>,
	logger: KtLogger
) => Partial<RecordClassProvider<GPT>> | Promise<Partial<RecordClassProvider<GPT>>> | undefined;
