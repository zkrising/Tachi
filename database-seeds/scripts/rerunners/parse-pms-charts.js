const fetch = require("node-fetch");
const { MutateCollection, ReadCollection, CreateChartID } = require("../util");
const logger = require("../logger");

const tableInfos = [
	{
		name: "発狂PMSデータベース(lv46～)",
		symbol: "P●",
		data_url: "https://pmsdatabase.github.io/insane_pmsdatabase/insane_pmsdatabase_score.json",
		level_order: [
			1,
			2,
			3,
			4,
			5,
			6,
			7,
			8,
			9,
			10,
			11,
			12,
			13,
			14,
			15,
			16,
			17,
			18,
			19,
			20,
			"!i",
			"？",
			"◆",
			"～",
		].map((e) => e.toString()),
	},
	{
		name: "PMSデータベース(Lv1~45)",
		symbol: "PLv",
		data_url: "https://pmsdatabase.github.io/pmsdatabase/pmsdatabase_score.json",
		level_order: [
			1,
			2,
			3,
			4,
			5,
			6,
			7,
			8,
			9,
			10,
			11,
			12,
			13,
			14,
			15,
			16,
			17,
			18,
			19,
			20,
			21,
			22,
			23,
			24,
			25,
			26,
			27,
			28,
			29,
			30,
			31,
			32,
			33,
			34,
			35,
			36,
			37,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			"45+",
			"?",
		].map((e) => e.toString()),
	},
];

const hasRandom = [
	"769aac4e9bad64547438251f860a0aea",
	"633943accbfaf1e782e9aa13229093c3",
	"2ff8c8b0a5b356e99a9f8a2bf9da2832",
	"836313ed8fc678a72b7870704c1238dd",
	"be5fa66cebdc93fecbe24d8374bded0d",
	"df81bc8022bd51e2e17dd9738b452041",
	"a8caeb99af594f40f7fff48b32066f89",
	"608bf3db51cd9150e2299ec51f4100ca",
	"1b823369559fe3222934b016b661ae12",
	"74307878f06f97e56d6a0d70cdc2caaf",
	"ab5a3e7023a00d484c72d371954bfec7",
	"7706336dab51e727bfc8c39f15b9b8c4",
	"4f5956a6334e809492ca242e9a42c716",
	"7272f671003e0192cf8e6402dbb4c92b",
	"11a9e65457a9d0ce86a7d2fcb92f20a0",
	"97e2781c785e228ec1d8dd936aefeb26",
	"a653d6f6cbaf5b250e9e9da81397f2e5",
	"e5576c4ae3faf95b4f77ec48032c7bb1",
	"c032c1c45a25ffbb3996d46b978228e7",
	"3064f6f5b04b9d8c45be299963de41dd",
	"8c16736ecc39c3b94b01163bf15a45d0",
	"5b314833ec377a259f4b9c48a1b5c85b",
	"8c7940010a72f0a48a037fe8391cd2fb",
	"a3da3ef759095cc21e14422e2a14f797",
	"0dc76d5e5fddc6768b1a2090a4afe35f",
	"c09e67e807d3be0d14695c3060ad7956",
	"aaa6a9021bffee4f930ae91f32774113",
	"bb9072b6b0460a5feb96a6a5dad45875",
	"b5e112417d68ab9bf9bd31655b383318",
	"b40d9e637e3ce07a3b4054ae7b453e8a",
	"725276e227259ff5613b7cba51903662",
	"0624e226b1341db8457aaa3f608370c5",
	"620c162aec244bc3a42e6daf3786cc18",
	"138dc09661f886a51b210af6a551487e",
	"e9a266efc4ec71fddbc4639ac626f23a",
	"59718af97aa91967dde2285c5aa4d736",
	"994fabe27b2d38152d5a1bb6d5e8de39",
	"aa271d610c9fbfda90456e83014a1219",
	"7df2d0d36b5a6445909430c96c54137f",
	"adc50317bed7fc028d3f8606653b692e",
	"ae044a61dbff57608bf4d7796b093246",
	"2bcbf73992b52b6ec3d5ee2f42242710",
	"2532497bca563bd2aa7887616e49cd5b",
	"5d34e01aa0f25ed30278518756f14c5f",
	"6a8223c80f24b9c2056dc23e093d36dd",
	"a524ca620432264e8f3343ef14062dea",
	"9c742c873dce4df4a949930238d3cbde",
	"df2f90e09069dd13d87da3ba152123aa",
	"4010caafe71464630760391f1652046b",
	"2d2d3268e83a8caccada4c0cd60a66ad",
	"8a54a27a27bba973b1dbee516de4a9f2",
	"7f89e8ee473955c9e7606eeb9415181f",
	"1c0adfdbdcda89c4c0472be4a6b36f0b",
	"d89148dce284949777d4704c68142cc4",
	"ceffedee6eab4dae4cced8a499df1aac",
	"48be2d81abb4aece3334a88fc47e90ad",
	"0d01d78db2588007f0efbc7ca567dd6d",
	"60db41bda92d0998668ab30aa6ee412b",
	"bc45e15c9e6f86dbd378575d5e421b86",
	"343d2073a79be1562e8f706150c387c1",
];

function FormatBMSTables(bmsTables) {
	return bmsTables.map((e) => `${e.table}${e.level}`).join(", ");
}

if (require.main === module) {
	(async () => {
		const charts = [];
		const songs = [];
		const existingMD5s = new Set(ReadCollection("charts-pms.json").map((e) => e.data.hashMD5));
		let i = Math.max(...ReadCollection("songs-pms.json").map(s => s.id)) + 1;

		for (const tableInfo of tableInfos) {
			// THE JSON SENT OVER THE WIRE IS INVALID!
			// We have to strip a Byte Order Mark ourselves. Why? No idea.
			// This is illegal JSON. How do people keep messing up such a simple format?
			const text = await fetch(tableInfo.data_url).then((r) => r.text());

			const data = JSON.parse(text.split(/^\uFEFF/u)[1]);

			for (const d of data) {
				if (existingMD5s.has(d.md5)) {
					continue;
				}

				if (hasRandom.includes(d.md5)) {
					continue;
				}

				if (!tableInfo.level_order.includes(d.level)) {
					logger.info(`Skipping unknown level ${d.level}`);
					continue;
				}

				const song = {
					id: i,
					title: d.title,
					artist: d.artist,
					searchTerms: [],
					altTitles: [],
					data: {
						genre: null,
						subtitle: null,
						subartist: null,
						tableString: FormatBMSTables([
							{
								table: tableInfo.symbol,
								level: d.level,
							},
						]),
					},
				};

				const l = Number(d.level);

				const tierlistInfo = Number.isNaN(l)
								   ? {}
								   : {
									   "sgl-EC": MakeTierlistStuff(l, tableInfo.symbol),
									   "sgl-HC": MakeTierlistStuff(l, tableInfo.symbol),
								   };

				const chart = {
					songID: i,
					chartID: CreateChartID(),
					rgcID: null,
					level: "?",
					levelNum: 0,
					playtype: "Controller",
					difficulty: "CHART",
					isPrimary: true,
					tierlistInfo,
					data: {
						notecount: Number(d.notes),
						hashMD5: d.md5,
						hashSHA256: d.sha256,
						tableFolders: [
							{
								table: tableInfo.symbol,
								level: d.level,
							},
						],
					},
					versions: [],
				};

				i++;

				songs.push(song);
				charts.push(chart);
				charts.push(
					Object.assign({}, chart, { chartID: CreateChartID(), playtype: "Keyboard" })
				);
			}
		}
		MutateCollection("songs-pms.json", currentSongs => currentSongs.concat(songs));
		MutateCollection("charts-pms.json", currentCharts => currentCharts.concat(charts));
	})();
}

function MakeTierlistStuff(l, symbol) {
	let value = l;
	if (symbol === "P●") {
		value = ConvertLevel(l);
	}

	return {
		value,
		text: value <= 45 ? `○${value.toString()}` : `●${l}`,
		individualDifference: false,
	};
}

function ConvertLevel(i) {
	return {
		1: 46,
		2: 46.5,
		3: 47,
		4: 47.25,
		5: 47.5,
		6: 48,
		7: 48.5,
		8: 49,
		9: 49.25,
		10: 49.5,
		11: 50,
		12: 50.5,
		13: 51,
		14: 51.5,
		15: 52,
		16: 52.5,
		17: 53,
		18: 53.5,
		19: 55,
		20: 55.5,
	}[i];
}
