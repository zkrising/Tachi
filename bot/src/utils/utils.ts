import {
	FormatGame,
	Game,
	Playtypes,
	IDStrings,
	UGSRatingsLookup,
	GetGamePTConfig,
	GetGameConfig,
} from "tachi-common";

export interface SimpleGameType<T extends Game> {
	game: T;
	playtype: Playtypes[T];
}

export const simpleGameTypeToString = <T extends Game>(gpt: SimpleGameType<T>): IDStrings =>
	`${gpt.game}:${gpt.playtype}` as IDStrings;

export const stringToSimpleGameType = (gptString: string): SimpleGameType<Game> => ({
	game: gptString.split(":")[0] as Game,
	playtype: gptString.split(":")[1] as Playtypes[Game],
});

export const formatGameWrapper = (gpt: SimpleGameType<Game>): string =>
	FormatGame(gpt.game, gpt.playtype);
export const formatGameWrapperSimple = (gpt: Game): string => GetGameConfig(gpt).name;

export const capitalise = (s: string): string => (s && s[0].toUpperCase() + s.slice(1)) || "";

export const prettyRatingString = <I extends IDStrings = IDStrings>(
	rating: UGSRatingsLookup[I]
): string => capitalise(rating);

export const getPfpUrl = (userId: number): string =>
	`https://kamaitachi.xyz/api/v1/users/${userId}-pfp`;

export const getGameImage = (gameId: string, game: Game): string =>
	`https://cdn.kamaitachi.xyz/game-icons/${game}/${gameId}`;

export const gameIdentifierStrings = [
	"iidx:SP",
	"iidx:DP",
	"sdvx:Single",
	"usc:Single",
	"ddr:SP",
	"ddr:DP",
	"maimai:Single",
	"museca:Single",
	"bms:7K",
	"bms:14K",
	"chunithm:Single",
	"gitadora:Gita",
	"gitadora:Dora",
];

export const simpleGameIdentifierStrings = [
	"iidx",
	"museca",
	"maimai",
	"sdvx",
	"ddr",
	"bms",
	"chunithm",
	"gitadora",
	"usc",
];

export const gamesToChoicesObject = (): [name: string, value: string][] =>
	gameIdentifierStrings.map((identifier) => [
		formatGameWrapper(stringToSimpleGameType(identifier)),
		identifier,
	]);

/** @description excludes play-types from options */
export const gamesToGenericChoicesObject = (): [name: string, value: string][] =>
	simpleGameIdentifierStrings.map((identifier) => [
		formatGameWrapperSimple(identifier as Game),
		identifier,
	]);

export const formatGameScoreRating = <I extends IDStrings = IDStrings>(
	gpt: SimpleGameType<Game>,
	ratingName: UGSRatingsLookup[I],
	value: number
): string => {
	const gptConfig = GetGamePTConfig(gpt.game, gpt.playtype);
	const val = gptConfig.profileRatingAlgFormatters[ratingName];
	if (val) {
		return val(value);
	}
	return value.toFixed(2);
};
