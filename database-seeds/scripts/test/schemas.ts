import p, { PrudenceSchema } from "prudence";
import { Game, Playtypes, GetGamePTConfig, GetGameConfig } from "tachi-common";
import { allSupportedGames } from "tachi-common/js/config/static-config";

function prSchemaify(schema: PrudenceSchema) {
	return (s: unknown): true => {
		const err = p(s, schema);

		if (err) {
			throw err;
		}

		return true;
	};
}

function IsValidPlaytype(game: Game, str: string): str is Playtypes[Game] {
	return GetGameConfig(game).validPlaytypes.includes(str as Playtypes[Game]);
}

function IsValidGame(str: string): str is Game {
	return allSupportedGames.includes(str as Game);
}

const getPlaytype = (game: Game, self: unknown): Playtypes[Game] => {
	if (!self || typeof self !== "object") {
		throw new Error("Expected an object.");
	}

	const gameConfig = GetGameConfig(game);

	const s = self as Record<string, unknown>;

	const playtype = s.playtype as string;
	if (!IsValidPlaytype(game, playtype)) {
		throw new Error(`Expected any of ${gameConfig.validPlaytypes.join(", ")}`);
	}

	return playtype;
};

const games = allSupportedGames;

const isValidPlaytype = (self: unknown, parent: Record<string, unknown>) => {
	if (!parent.game || typeof parent.game !== "string" || !IsValidGame(parent.game)) {
		throw new Error(`Invalid Schema, need game to base IsValidPlaytype off of.`);
	}

	if (typeof self !== "string") {
		return "Expected a string.";
	}

	if (!IsValidPlaytype(parent.game, self)) {
		return `Expected a valid playtype for ${parent.game}`;
	}

	return true;
};

const PR_SongDocument = (data: PrudenceSchema): PrudenceSchema => ({
	id: p.isPositiveInteger,
	title: "string",
	artist: "string",
	searchTerms: ["string"],
	altTitles: ["string"],
	data,
});

const PR_ChartDocument = (
	game: Game,
	playtype: Playtypes[Game],
	data: PrudenceSchema
): PrudenceSchema => {
	const gptConfig = GetGamePTConfig(game, playtype);

	return {
		songID: p.isPositiveInteger,
		chartID: "string",
		rgcID: "?string",
		level: "string",
		levelNum: "number",
		isPrimary: "boolean",
		difficulty: p.isIn(gptConfig.difficulties),
		playtype: p.is(playtype),
		data,
		tierlistInfo: Object.fromEntries(
			gptConfig.tierlists.map((t) => [
				t,
				p.optional({ text: "string", value: "number", individualDifference: "*boolean" }),
			])
		),
		versions: [p.isIn(gptConfig.supportedVersions)],
	};
};

export const SCHEMAS = {
	"bms-course-lookup": prSchemaify({
		title: "string",
		// Must be comprised of 4 md5 hashes, which are 32 chars long.
		md5sums: (self) => {
			if (typeof self !== "string") {
				return "Expected a string";
			}

			if (self.length !== 32 * 4) {
				return "Expected 32 * 4 characters (4 md5 hashes long).";
			}

			if (!self.match(/^[a-z0-9]*$/u)) {
				return "Expected all chars to be in the range of a-z0-9.";
			}

			return true;
		},
		set: p.isIn("genocideDan", "stslDan"),
		playtype: p.isIn("7K", "14K"),
		value: p.isInteger,
	}),
	folders: prSchemaify({
		title: "string",
		game: p.isIn(games),
		playtype: isValidPlaytype,
		folderID: "string",
		inactive: "boolean",
		searchTerms: ["string"],
		type: p.isIn("songs", "charts", "static"),
		data: (self, parent) => {
			if (parent.type === "songs") {
				return true; //temp. should be a song.
			} else if (parent.type === "charts") {
				return true; //temp. should be a chart.
			}

			return (
				(Array.isArray(self) && self.every((r) => typeof r === "string")) ||
				"Expected an array of only strings."
			);
		},
	}),
	tables: prSchemaify({
		tableID: "string",
		game: p.isIn(games),
		playtype: isValidPlaytype,
		title: "string",
		default: "boolean",
		description: "string",
		folders: ["string"],
		inactive: "boolean",
	}),
	"songs-bms": prSchemaify(
		PR_SongDocument({
			genre: "?string",
			subtitle: "?string",
			subartist: "?string",
			tableString: "?string",
		})
	),
	"songs-chunithm": prSchemaify(
		PR_SongDocument({
			genre: "string",
			displayVersion: "string",
		})
	),
	// "songs-ddr": prSchemaify(
	// 	PR_SongDocument({
	// 		displayVersion: "string",
	// 	})
	// ),
	"songs-sdvx": prSchemaify(
		PR_SongDocument({
			displayVersion: "string",
		})
	),
	"songs-usc": prSchemaify(PR_SongDocument({})),
	// "songs-maimai": prSchemaify(
	// 	PR_SongDocument({
	// 		titleJP: "string",
	// 		artistJP: "string",
	// 		displayVersion: "string",
	// 	})
	// ),
	"songs-museca": prSchemaify(
		PR_SongDocument({
			titleJP: "string",
			artistJP: "string",
			displayVersion: "string",
		})
	),
	// "songs-gitadora": prSchemaify(
	// 	PR_SongDocument({
	// 		isHot: "boolean",
	// 	})
	// ),
	"songs-iidx": prSchemaify(
		PR_SongDocument({
			genre: "string",
			displayVersion: "string",
		})
	),
	"songs-wacca": prSchemaify(
		PR_SongDocument({
			genre: "string",
			displayVersion: "?string",
			titleJP: "string",
			artistJP: "string",
		})
	),
	"songs-pms": prSchemaify(
		PR_SongDocument({
			genre: "?string",
			subtitle: "?string",
			subartist: "?string",
			tableString: "?string",
		})
	),
	"songs-popn": prSchemaify(
		PR_SongDocument({
			genre: "string",
			displayVersion: "?string",
		})
	),
	"songs-jubeat": prSchemaify(
		PR_SongDocument({
			displayVersion: "string",
		})
	),
	"charts-iidx": (self) => {
		const playtype = getPlaytype("iidx", self);

		return prSchemaify(
			PR_ChartDocument("iidx", playtype, {
				notecount: p.isPositiveNonZeroInteger,
				inGameID: p.or(p.isPositiveNonZeroInteger, [p.isPositiveNonZeroInteger]),
				arcChartID: "?string",
				hashSHA256: "?string",
				"2dxtraSet": "?string",
				kaidenAverage: "?number",
				worldRecord: "?number",
				bpiCoefficient: "?number",
			})
		)(self);
	},
	"charts-bms": (self) => {
		const playtype = getPlaytype("bms", self);

		return prSchemaify(
			PR_ChartDocument("bms", playtype, {
				notecount: p.isPositiveNonZeroInteger,
				hashSHA256: "?string",
				hashMD5: "?string",
				tableFolders: [
					{
						table: "string",
						level: "string",
					},
				],
			})
		)(self);
	},
	"charts-chunithm": prSchemaify(
		PR_ChartDocument("chunithm", "Single", {
			inGameID: p.isPositiveInteger,
		})
	),
	"charts-jubeat": prSchemaify(
		PR_ChartDocument("jubeat", "Single", {
			inGameID: p.isPositiveInteger,
			isHardMode: "boolean",
		})
	),
	// "charts-gitadora": (self) => {
	// 	const playtype = getPlaytype("gitadora", self);

	// 	return prSchemaify(
	// 		PR_ChartDocument("gitadora", playtype, {
	// 			inGameID: p.isPositiveInteger,
	// 		})
	// 	)(self);
	// },
	// "charts-ddr": (self) => {
	// 	const playtype = getPlaytype("ddr", self);

	// 	return prSchemaify(
	// 		PR_ChartDocument("ddr", playtype, {
	// 			inGameID: "string",
	// 			songHash: "string",
	// 		})
	// 	)(self);
	// },
	// "charts-maimai": prSchemaify(
	// 	PR_ChartDocument("maimai", "Single", {
	// 		maxPercent: p.gt(0),
	// 		inGameID: p.isPositiveInteger,
	// 		inGameStrID: "string",
	// 	})
	// ),
	"charts-museca": prSchemaify(
		PR_ChartDocument("museca", "Single", {
			inGameID: p.isPositiveInteger,
		})
	),
	"charts-sdvx": prSchemaify(
		PR_ChartDocument("sdvx", "Single", {
			inGameID: p.isPositiveInteger,
			arcChartID: "?string",
		})
	),
	"charts-usc": (self) => {
		const playtype = getPlaytype("usc", self);

		return prSchemaify(
			PR_ChartDocument("usc", playtype, {
				hashSHA1: p.or("string", ["string"]),
				isOfficial: "boolean",
			})
		)(self);
	},
	"charts-wacca": prSchemaify(
		PR_ChartDocument("wacca", "Single", {
			isHot: "boolean",
		})
	),
	"charts-pms": (self) => {
		const playtype = getPlaytype("pms", self);

		return prSchemaify(
			PR_ChartDocument("pms", playtype, {
				notecount: p.isPositiveNonZeroInteger,
				hashSHA256: "?string",
				hashMD5: "?string",
				tableFolders: [
					{
						table: "string",
						level: "string",
					},
				],
			})
		)(self);
	},
	"charts-popn": prSchemaify(
		PR_ChartDocument("popn", "9B", {
			hashSHA256: "?string",
			inGameID: p.isPositiveInteger,
		})
	),
};
