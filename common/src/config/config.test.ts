import { GetGameConfig, GetGamePTConfig, allSupportedGames } from "./config";
import t from "tap";

t.test("#GetGameConfig", (t) => {
	t.plan(allSupportedGames.length);

	for (const game of allSupportedGames) {
		// i don't feel *that* strongly about this restriction, but game IDs *definitely*
		// can't have things like `:` in them.
		t.match(game, /^[a-z]+$/u, "Game IDs must be a-z only.");

		const conf = GetGameConfig(game);

		t.not(conf, undefined, `'${game}' should have a config defined.`);
		t.ok(
			conf.playtypes.includes(conf.defaultPlaytype),
			"Default playtype should be in the array of playtypes."
		);
	}
});

t.test("#GetGamePTConfig", (t) => {
	for (const game of allSupportedGames) {
		const gameConfig = GetGameConfig(game);

		for (const playtype of gameConfig.playtypes) {
			const conf = GetGamePTConfig(game, playtype);

			t.not(conf, undefined, `'${game}:${playtype}' should have a config defined.`);

			t.ok(
				conf.scoreRatingAlgs[conf.defaultScoreRatingAlg],
				"The default score rating alg should have an implementation."
			);

			t.ok(
				conf.sessionRatingAlgs[conf.defaultSessionRatingAlg],
				"The default session rating alg should have an implementation."
			);

			t.ok(
				conf.profileRatingAlgs[conf.defaultProfileRatingAlg],
				"The default profile rating alg should have an implementation."
			);

			if (conf.difficultyConfig.type === "FIXED") {
				t.ok(
					conf.difficultyConfig.difficultyOrder.includes(
						conf.difficultyConfig.defaultDifficulty
					),
					"The default difficulty should be part of difficultyOrder."
				);
			}
		}
	}

	t.end();
});
