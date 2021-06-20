import t from "tap";
import { GetGameConfig, GetGamePTConfig } from "./config";
import { allSupportedGames } from "./static-config";

t.test("#GetGameConfig", (t) => {
    t.plan(allSupportedGames.length);

    for (const game of allSupportedGames) {
        t.equal(GetGameConfig(game).internalName, game);
    }
});

// i have no idea why this one doesn't need t.end()
// and this one does
t.test("#GetGamePTConfig", (t) => {
    for (const game of allSupportedGames) {
        const gameConfig = GetGameConfig(game);

        for (const playtype of gameConfig.validPlaytypes) {
            t.equal(GetGamePTConfig(game, playtype).idString, `${game}:${playtype}`);
        }
    }

    t.end();
});
