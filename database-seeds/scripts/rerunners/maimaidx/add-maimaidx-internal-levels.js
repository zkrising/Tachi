const { Command } = require("commander");
const { parse } = require("csv-parse/sync");
const fs = require("fs");
const { ReadCollection, MutateCollection } = require("../../util");

// run parse-maimaidx-dataset.js first!!!

// Internal levels for FESTiVAL songs are at
// https://docs.google.com/spreadsheets/d/1xbDMo-36bGL_d435Oy8TTVq4ADFmxl9sYFqhTXiJYRg/edit

// Download a sheet as CSV and use -f <CSV filename>.

const diffMap = new Map([
	["BAS", "Basic"],
	["ADV", "Advanced"],
	["EXP", "Expert"],
	["MAS", "Master"],
	["ReMAS", "Re:Master"],
]);

const categoryMap = new Map([
	["POPS&アニメ", "POPS＆アニメ"],
	["niconico", "niconico＆ボーカロイド"],
	["東方", "東方Project"],
	["maimaiオリジナル", "maimai"],
	["ゲーム&Variety", "ゲーム＆バラエティ"],
	["ゲキチュウ", "オンゲキ＆CHUNITHM"],
]);

const manualTitleMap = new Map([
	// 14 and higher
	["Excalibur ～Revived Resolution～", "Excalibur ～Revived resolution～"],
	["Sqlupp(Camellia's Sqleipd*Hiytex Remix)", 'Sqlupp (Camellia\'s "Sqleipd*Hiytex" Remix)'],
	["≠彡゛/了→", '≠彡"/了→'],
	["Mjolnir", "Mjölnir"],
	["FREEDOM DiVE(tpz Overcute Remix)", "FREEDOM DiVE (tpz Overcute Remix)"],

	// 13+
	["GRANDIR", "GRÄNDIR"],
	["D✪N’T ST✪P R✪CKIN’", "D✪N’T  ST✪P  R✪CKIN’"],
	["Seclet Sleuth", "Secret Sleuth"], // bruh
	["L'epilogue", "L'épilogue"],

	// 13
	[
		"REVIVER オルタンシア･サーガ-蒼の騎士団- オリジナルVer.",
		"REVIVER オルタンシア・サーガ -蒼の騎士団- オリジナルVer.",
	],
	[
		"チルノのパーフェクトさんすう教室6 ⑨周年バージョン",
		"チルノのパーフェクトさんすう教室　⑨周年バージョン",
	],
	[
		"【東方ニコカラ】秘神マターラfeat.魂音泉【IOSYS】",
		"【東方ニコカラ】秘神マターラ feat.魂音泉【IOSYS】",
	],
	["Save This World νMix", "Save This World νMIX"],
	["ウッーウッーウマウマ( ﾟ∀ﾟ)", "ウッーウッーウマウマ(ﾟ∀ﾟ)"],
	["砂の惑星 feat.HATSUNE MIKU", "砂の惑星 feat. HATSUNE MIKU"],
	[
		"Seyana.～何でも言うことを聞いてくれるアカネチャン～",
		"Seyana. ～何でも言うことを聞いてくれるアカネチャン～",
	],
	["レッツゴー！陰陽師", "レッツゴー!陰陽師"],
	["L4TS:2018(feat.あひる＆KTA)", "L4TS:2018 (feat. あひる & KTA)"],
	["曖昧Mind", "曖昧mind"],
	["紅星ミゼラブル〜廃憶編", "紅星ミゼラブル～廃憶編"],
	["ファンタジーゾーンOPA!-OPA! -GMT remix-", "ファンタジーゾーン OPA-OPA! -GMT remix-"],
	["Turn Around", "Turn around"],
	["ぼくたちいつでもしゅわっしゅわ！", "ぼくたちいつでも　しゅわっしゅわ！"],
	["God Knows…", "God knows..."],
	["Jorqer", "Jörqer"],
	["スカーレット警察のゲットーパトロール２４時", "スカーレット警察のゲットーパトロール24時"],
]);

function normalizeTitle(title) {
	return title
		.toLowerCase()
		.replaceAll(" ", "")
		.replaceAll("　", "")
		.replaceAll(" ", "")
		.replaceAll("：", ":")
		.replaceAll("（", "(")
		.replaceAll("）", ")")
		.replaceAll("！", "!")
		.replaceAll("？", "?")
		.replaceAll("`", "'")
		.replaceAll("’", "'")
		.replaceAll("”", '"')
		.replaceAll("“", '"')
		.replaceAll("～", "~")
		.replaceAll("－", "-")
		.replaceAll("＠", "@");
}

function findSong(songs, title, category) {
	// There are two songs with the exact same title and that only differs
	// by category:
	// - Link (maimai) is 68
	// - Link (niconico) is 244
	if (title === "Link") {
		return songs.find((s) => s.id === (category === "maimai" ? 68 : 244));
	}
	return songs.find(
		(s) =>
			normalizeTitle(s.title) === normalizeTitle(title) ||
			s.title === manualTitleMap.get(title)
	);
}

function calculateDisplayLevel(internalLevel) {
	const plusDifficulty = (internalLevel * 10) % 10 >= 7;
	const level = `${Math.floor(internalLevel)}${plusDifficulty ? "+" : ""}`;
	return level;
}

function calculateDifficulty(style, sheetDifficulty) {
	return `${style === "DX" ? `${style} ` : ""}${diffMap.get(sheetDifficulty)}`;
}

function addTmaiSheet(csvData) {
	const songs = ReadCollection("songs-maimaidx.json");

	MutateCollection("charts-maimaidx.json", (charts) => {
		for (let rowNumber = 1; ; rowNumber++) {
			const row = csvData[rowNumber];
			const title = row[1];
			if (!title) {
				break;
			}

			const song = songs.find((s) => s.title === title);
			if (!song) {
				console.log(`Could not find song ${title}`);
				continue;
			}

			const difficulty = calculateDifficulty(row[2], row[3]);
			const chart = charts.find((c) => c.songID === song.id && c.difficulty === difficulty);
			if (!chart) {
				console.log(`Could not find chart ${difficulty} for ${title}`);
				continue;
			}

			const internalLevel = Number(row[7]);
			const level = calculateDisplayLevel(internalLevel);
			if (chart.level !== level) {
				console.log(
					`Overwriting level for ${song.title} [${chart.difficulty}]: ${chart.level} -> ${level}`
				);
				chart.level = level;
			}
			if (chart.levelNum !== internalLevel) {
				console.log(
					`Overwriting levelNum for ${song.title} [${chart.difficulty}]: ${chart.levelNum} -> ${internalLevel}`
				);
				chart.levelNum = internalLevel;
			}
		}
		return charts;
	});
}

/**
 * Adds internal levels to charts from a CSV file.
 * @param {string[][]} csvData raw CSV data
 * @param {boolean} parseCategory whether to include category header in parsing
 * @param {number} headerRow the index (starting from 0) of the first row with a song
 * 	(or with category if `parseCategory` is `true`)
 *
 *  TO BE CONSIDERED A CATEGORY ROW THERE MUST ONLY BE CONTENT IN THE TITLE CELL!!!
 * @param {boolean} hasCategoryColumn whether there is a category column for each song
 * @param {boolean} markLatest whether to mark chart as latest
 */
function addOtherSheet(csvData, parseCategory, headerRow, hasCategoryColumn, markLatest) {
	const songs = ReadCollection("songs-maimaidx.json");
	const categoryColumnOffset = hasCategoryColumn ? 1 : 0;
	let currentCategory = "";

	MutateCollection("charts-maimaidx.json", (charts) => {
		for (
			let colNumber = 0;
			colNumber + 4 + categoryColumnOffset < csvData[0].length;
			colNumber += 6 + categoryColumnOffset
		) {
			for (let rowNumber = headerRow; rowNumber < csvData.length; rowNumber++) {
				const row = csvData[rowNumber];
				const title = row[colNumber];

				if (
					parseCategory &&
					title &&
					[1, 2, 3, 4].every((i) => !row[colNumber + categoryColumnOffset + i])
				) {
					currentCategory = categoryMap.get(title);
					continue;
				}

				const style = row[colNumber + categoryColumnOffset + 1];
				if (style !== "DX" && style !== "STD") {
					continue;
				}

				const sheetDifficulty = row[colNumber + categoryColumnOffset + 2];
				const internalLevelString = row[colNumber + categoryColumnOffset + 4];
				if (!internalLevelString || internalLevelString === "#N/A") {
					continue;
				}
				const internalLevel = Number(internalLevelString);
				const level = calculateDisplayLevel(internalLevel);

				const song = findSong(songs, title, currentCategory);
				if (!song) {
					console.log(`Could not find song ${title}`);
					continue;
				}

				const difficulty = calculateDifficulty(style, sheetDifficulty);
				const chart = charts.find(
					(c) => c.songID === song.id && c.difficulty === difficulty
				);
				if (!chart) {
					console.log(`Could not find chart ${difficulty} for ${title}`);
					continue;
				}
				if (chart.level !== level) {
					console.log(
						`Overwriting level for ${song.title} [${chart.difficulty}]: ${chart.level} -> ${level}`
					);
					chart.level = level;
				}
				if (chart.levelNum !== internalLevel) {
					console.log(
						`Overwriting levelNum for ${song.title} [${chart.difficulty}]: ${chart.levelNum} -> ${internalLevel}`
					);
					chart.levelNum = internalLevel;
				}
				if (chart.data.isLatest !== markLatest) {
					console.log(
						`Marking ${song.title} [${chart.difficulty}]'s isLatest to ${markLatest}`
					);
					chart.data.isLatest = markLatest;
				}
			}
		}
		return charts;
	});
}

const program = new Command();
program.option("-f, --file <filename>", "CSV file to read from");
program.parse(process.argv);
const options = program.opts();

const csvData = parse(fs.readFileSync(options.file));
const newSongsSheet = options.file.includes("新曲.csv");
const tmaiSheet = options.file.includes(" - Tmai.csv");
const highLevelSheet = / - (14以上|13+|13).csv$/u.test(options.file);

if (tmaiSheet) {
	addTmaiSheet(csvData);
} else if (newSongsSheet) {
	addOtherSheet(csvData, false, 8, false, true);
} else if (highLevelSheet) {
	addOtherSheet(csvData, false, 4, true, false);
} else {
	addOtherSheet(csvData, true, 3, true, false);
}
