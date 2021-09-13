/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import {
	FormatGame,
	GetGameConfig,
	GetGamePTConfig,
	IDStrings,
	integer,
	StaticConfig,
} from "tachi-common";
import fjsh from "fast-json-stable-hash";
import CreateLogCtx from "lib/logger/logger";
import { BMS_TABLES } from "lib/constants/bms-tables";
import { CreateFolderID } from "utils/folder";

const logger = CreateLogCtx(__filename);

function StrRange(min: integer, max: integer) {
	const arr = [];
	for (let i = min; i <= max; i++) {
		arr.push(i.toString());
	}
	return arr;
}

// These are the games that have simple, discrete folders.
const STATIC_LEVELS: Partial<Record<IDStrings, string[]>> = {
	"iidx:SP": StrRange(1, 12),
	"iidx:DP": StrRange(1, 12),
	"bms:7K": [],
	"bms:14K": [],
	"chunithm:Single": [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"7+",
		"8",
		"8+",
		"9",
		"9+",
		"10",
		"10+",
		"11",
		"11+",
		"12",
		"12+",
		"13",
		"13+",
		"14",
		"14+",
	],
	"maimai:Single": [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"7+",
		"8",
		"8+",
		"9",
		"9+",
		"10",
		"10+",
		"11",
		"11+",
		"12",
		"12+",
		"13",
		"13+",
		"14",
	],
	"museca:Single": StrRange(1, 15),
	"sdvx:Single": StrRange(1, 20),
	"ddr:SP": StrRange(1, 20),
	"ddr:DP": StrRange(1, 20),
};

async function InsertStaticLevelVersionFolders() {
	// Little known fact: I invented the cyclomatic complexity warning
	for (const { game, playtype } of GPTYielder()) {
		const gameConfig = GetGameConfig(game);
		const gptConfig = GetGamePTConfig(game, playtype);

		for (const version of gptConfig.supportedVersions) {
			// @ts-expect-error dont worry
			const staticLevels = STATIC_LEVELS[`${game}:${playtype}`];

			if (!staticLevels) {
				continue;
			}

			let inactive = false;

			if (
				!(
					gptConfig.currentGameOmniVersion === version ||
					gptConfig.currentLatestVersion === version ||
					gptConfig.currentLocalVersion === version
				)
			) {
				inactive = true;
			}

			await db.tables.insert({
				tableID: `${game}-${playtype}-${version}-levels`,
				description: `Levels for ${FormatGame(game, playtype)} in version ${version}.`,
				title: `${FormatGame(game, playtype)} (${version})`,
				folders: [],
				game,
				playtype,
				inactive,
			});

			for (const level of staticLevels) {
				const query = {
					level,
					versions: version,
				};

				const folderID = CreateFolderID(query, game, playtype);

				await db.folders.insert({
					folderID,
					game,
					playtype,
					title: `Level ${level} (${version})`,
					type: "charts",
					data: query,
					inactive,
				});

				await db.tables.update(
					{
						tableID: `${game}-${playtype}-${version}-levels`,
					},
					{
						$push: {
							folders: folderID,
						},
					}
				);

				logger.info(`Inserted ${gameConfig.name} Level ${level} (${version})`);
			}
		}
	}

	logger.info(`Done.`);
}

function* GPTYielder() {
	for (const game of StaticConfig.allSupportedGames) {
		const gameConfig = GetGameConfig(game);
		for (const playtype of gameConfig.validPlaytypes) {
			yield { game, playtype };
		}
	}
}

// Some games don't use "fixed" levels per se, and as such breaking
// the folders up are quite hard. This is for *those* games.
async function InsertCustomStuff() {}

(async () => {
	await InsertStaticLevelVersionFolders();
})();
