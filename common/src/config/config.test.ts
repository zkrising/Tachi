import { GetGameConfig, GetGamePTConfig } from "./old-config";
import { allSupportedGames } from "../constants/import-types";
import t from "tap";

t.test("#GetGameConfig", (t) => {
	t.plan(allSupportedGames.length);

	for (const game of allSupportedGames) {
		t.equal(GetGameConfig(game).internalName, game);
	}
});

t.test("#GetGamePTConfig", (t) => {
	for (const game of allSupportedGames) {
		const gameConfig = GetGameConfig(game);

		for (const playtype of gameConfig.validPlaytypes) {
			const conf = GetGamePTConfig(game, playtype);

			t.equal(
				conf.idString,
				`${game}:${playtype}`,
				`Should return the right GamePTConfig (${game} ${playtype})`
			);

			t.equal(
				conf.gradeBoundaries.length,
				conf.grades.length,
				`Should have the same amount of grades as grade boundaries. (${game} ${playtype})`
			);
		}
	}

	t.end();
});
