const fetch = require("node-fetch");
const { CreateChartID, ReadCollection, WriteCollection } = require("../../util");

const DATA_URL = "https://maimai.sega.jp/data/maimai_songs.json";

const versionMap = new Map([
	[0, null],
	[100, "maimai"],
	[110, "maimai PLUS"],
	[120, "GreeN"],
	[130, "GreeN PLUS"],
	[140, "ORANGE"],
	[150, "ORANGE PLUS"],
	[160, "PiNK"],
	[170, "PiNK PLUS"],
	[180, "MURASAKi"],
	[185, "MURASAKi PLUS"],
	[190, "MiLK"],
	[195, "MiLK PLUS"],
	[199, "FiNALE"],
	[200, "maimaiでらっくす"],
	[205, "maimaiでらっくす PLUS"],
	[210, "Splash"],
	[215, "Splash PLUS"],
	[220, "UNiVERSE"],
	[225, "UNiVERSE PLUS"],
	[230, "FESTiVAL"],
]);

const diffNames = ["bas", "adv", "exp", "mas", "remas"];

const diffMap = new Map([
	["bas", "Basic"],
	["adv", "Advanced"],
	["exp", "Expert"],
	["mas", "Master"],
	["remas", "Re:Master"],
]);

(async () => {
	const songs = ReadCollection("songs-maimaidx.json");
	const charts = ReadCollection("charts-maimaidx.json");

	const existingSongs = new Map(songs.map((e) => [e.title, e.id]));
	const existingCharts = new Map(charts.map((e) => [`${e.songID} ${e.difficulty}`, e.chartID]));

	const datum = await fetch(DATA_URL).then((r) => r.json());

	// not properly implemented yet as i can't find romaji titles for
	// japanese titled songs
	const searchTerms = [];
	const altTitles = [];

	let songID = Math.max(Math.max(...existingSongs.values()), 0) + 1;

	for (const data of datum) {
		let thisSongID = songID;

		const version = Number(data.version.substring(0, 3));

		if (existingSongs.has(data.title)) {
			thisSongID = existingSongs.get(data.title);
		} else {
			songID++;
			songs.push({
				id: thisSongID,
				title: data.title.trim(),
				artist: data.artist.trim(),
				searchTerms,
				altTitles,
				data: {
					displayVersion: versionMap.get(version),
				},
			});
		}

		diffNames.forEach((diff) => {
			// check for existence of difficulty
			if (!data[`dx_lev_${diff}`]) {
				return;
			}

			if (existingCharts.get(`${thisSongID} DX ${diffMap.get(diff)}`)) {
				return;
			}

			const chartID = CreateChartID();
			const isLatest = Number(version) === 225;

			const lvNum = Number(data[`dx_lev_${diff}`].replace(/\+/u, ".7"));

			charts.push({
				songID: thisSongID,
				chartID: chartID,
				level: data[`dx_lev_${diff}`],
				levelNum: lvNum,
				isPrimary: true,
				difficulty: `DX ${diffMap.get(diff)}`,
				playtype: "Single",
				data: {
					isLatest,
				},
				versions: ["universeplus"],
			});
		});

		diffNames.forEach((diff) => {
			// check for existence of difficulty
			if (!data[`lev_${diff}`]) {
				return;
			}

			if (existingCharts.get(`${thisSongID} ${diffMap.get(diff)}`)) {
				return;
			}

			const chartID = CreateChartID();
			const isLatest = Number(version) === 225;

			const lvNum = Number(data[`lev_${diff}`].replace(/\+/u, ".7"));

			charts.push({
				songID: thisSongID,
				chartID: chartID,
				rgcID: null,
				level: data[`lev_${diff}`],
				levelNum: lvNum,
				isPrimary: true,
				difficulty: diffMap.get(diff),
				playtype: "Single",
				data: {
					isLatest,
				},
				tierlistInfo: {},
				versions: ["universeplus"],
			});
		});
	}

	WriteCollection("charts-maimaidx.json", charts);
	WriteCollection("songs-maimaidx.json", songs);
})();
