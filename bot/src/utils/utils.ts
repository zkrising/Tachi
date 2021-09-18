import { FormatGame, Game, Playtypes } from "tachi-common";
import { IDStrings, UGSRatingsLookup } from "tachi-common/js/types";
import { ProcessEnv } from "../setup";
import { PrependTachiUrl } from "./fetch-tachi";

export interface SimpleGameType<T extends Game> {
	game: T;
	playtype: Playtypes[T];
}

export const simpleGameTypeToString = <T extends Game>(game: SimpleGameType<T>): IDStrings =>
	<IDStrings>`${game.game}:${game.playtype}`;

export const stringToSimpleGameType = (game: string): SimpleGameType<Game> => {
	return { game: <Game>game.split(":")[0], playtype: <Playtypes[never]>game.split(":")[1] };
};

export const formatGameWrapper = (game: SimpleGameType<Game>): string => FormatGame(game.game, game.playtype);

export const prettyRatingString = <I extends IDStrings = IDStrings>(rating: UGSRatingsLookup[I]): string => {
	switch (rating) {
		case "ktRating":
			return "Kamai Rating";
		case "ktLampRating":
			return "Kamai Lamp Rating";
		case "sieglinde":
			return "???";
		case "VF6":
			return "Volforce";
		case "BPI":
			return "Beat Power Index";
		case "MFCP":
			return "MFCs";
		default:
			return "Skill";
	}
};

export const getPfpUrl = (userId: number): string => {
	if (ProcessEnv.ENV !== "prod") {
		return `https://kamaitachi.xyz/static/images/users/${userId}-pfp.png`;
	}
	return PrependTachiUrl(`/users/${userId}/pfp`);
};
