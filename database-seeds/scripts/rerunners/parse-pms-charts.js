const fetch = require("node-fetch");
const { MutateCollection, ReadCollection, CreateChartID } = require("../util");
const logger = require("../logger");

const tableInfo = {
	"name": "発狂PMSデータベース(lv46～)",
	"symbol": "P●",
	"data_url": "https://pmsdifficulty.xxxxxxxx.jp/insane_pmsdatabase/insane_pmsdatabase_score.json",
	"level_order": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
		"!i", "？", "◆", "～"
	].map(e => e.toString())
}

const hasRandom = ["769aac4e9bad64547438251f860a0aea", "633943accbfaf1e782e9aa13229093c3", "7c305b8a003d4578b58cd26236f29d10", "8729dd951263fa4636e54ff191b864c4", "13203d1e1076b42d3e4bb429870c5ada", "4cea997415cc8f2be6b61667b01913f3", "64c61e76a8173efa4cf0b9b5554813ed", "78182197c48a3db307ecbc4d9df83954", "2ff8c8b0a5b356e99a9f8a2bf9da2832", "619c8357df2399ae18e22c4e36b2be95", "188ac44b91c8f97436dd74b2d6825f2e", "ff2d2ffa4ae22da44b8cc3f20597a899", "778aeea01fdea30a4287e7b2eb19ee11", "2ea031596696506e9d6d58354399e453", "507bc8bb28eaa904942a630b09155b32", "a1089fb46ad31d4f2e5bdcb89c4ca450", "a4cab8697eb3d01da02e8f919a6aa623", "8ed1cf85741113aaf857e2965d4e4272", "6dd9ab107eb20bbaeea02fa3ec0f33d2", "00351165ad4deb19dd03e059138a4a8d", "836313ed8fc678a72b7870704c1238dd", "be5fa66cebdc93fecbe24d8374bded0d", "570c7e899e1cade06de5ebcbf52d9c02", "9699fa026cb94b3c120114dd3311d70a", "b6686bf87b0109510a3f65738868b197", "a65116913eb65b1ecdd2f49aa4fe3d0b", "b65a3e717c68561ae9804001fa534fa5", "623c71599979807ce585c0b520fb79ca", "715fa80618eeb3c0e2aa8219ef5a5207", "117d4598613c124b363561118808a13d", "a5a9774d73b86d4417da071e86d3e3c0", "578dc4c94adf0c34b45663eb4a85a838", "caf153b8021978ae8f9df99c2af233d9", "89dfa8569d80c9740b4688c0c4817333", "ed7212665806b5001731bf221739ed36", "25356f8d57abcdf0b06b8e5602e0ccf1", "1824aa65b7e6c8b7723e635ad6639101", "b01d663a2a02c660981056d7f16df586", "9bcc87ca47c213d47c910eb42784a36b", "df81bc8022bd51e2e17dd9738b452041", "a8caeb99af594f40f7fff48b32066f89", "608bf3db51cd9150e2299ec51f4100ca", "4d1b54f56bde5b2279a44fdfe096413f", "0c10a05600ea952624c929253bf4ce8a", "6df46e4c7f11a01eb2a362c02f17ed22", "9ff5bdd19778f4fa67984b5b7492e036", "10b1f6d46172ca42292dd53533670daa", "97aec799b90fd5bea919ad7eb8ae1e5e", "010c173afbaa3eb6d78005836f687a10", "2c1518c284eef37d9710dca5236d545e", "ab6b23baf829811a17ac367aae043b19", "e8c0d51d4086da5ab5c8f61e69397615", "cff001e1b62d1b725ce16bf5a1065d14", "1b823369559fe3222934b016b661ae12", "a1dc473d8b85302571f25b6a93269d26", "5e8182cfe19b53c915aa89afc9e069c0", "6e98007ab76c890a7dc7a7b9a7f0ee21", "886b376a46a7f9c397b62e539ed294bc", "28846fa5c003b5228dea15d9588b26ef", "a1a8fc59d659db3421fc992e6ed43ebb", "70cbd8da12ab2d623ea64a7ff59d6017", "38c455db117cd47abe7ec84adcb82703", "384e6e5390d91bf026ad92de3e736b67", "fbfd4a93aa3e91e758d6a767bfc1e782", "b3ec50bc5d0c8bf9938aeb39a215139f", "088a4dbae11c802dcbd0b313eeb69068", "726cf167d76d14c40ef22c6684614107", "90bfa7091b38bc322af3ec08cc455e43", "74307878f06f97e56d6a0d70cdc2caaf", "ab5a3e7023a00d484c72d371954bfec7", "7706336dab51e727bfc8c39f15b9b8c4", "4f5956a6334e809492ca242e9a42c716", "7272f671003e0192cf8e6402dbb4c92b", "ad0af27bbe31f4a95f63d38ce3097a5c", "743b0415fb37ed722ebc8fdcd6566b1c", "99049f4e27c1075f5c2a8bee2a6078da", "204d1e686918408ff168d13ffc06a572", "85ca525f01d26e432f9595ba148438f6", "11a9e65457a9d0ce86a7d2fcb92f20a0", "97e2781c785e228ec1d8dd936aefeb26", "a653d6f6cbaf5b250e9e9da81397f2e5", "6d1522b0beb17d68ad4230b0158c4652", "f9060a24e376900064eb89cc124e0d94", "1823e859b25257450139c44c670cf6a9", "1edba00a2065fea20698be50c53aa469", "108b628730e6b6d95a934dc753ba7800", "765df7084717a95d8b661d94470d9874", "b6f9d18e20f9fbfcc0f58a8249701c39", "6c37a50657fc642ceba428745aa05524", "645d96cd1ab254cb2960882c91e59818", "e5576c4ae3faf95b4f77ec48032c7bb1", "7fea808fa65ee1a8b692d6949e76de62", "a697c5cc8c4dcbc81b5349a8299cfd2f", "9382ec316f372840b9f07ab68adfd4be", "c032c1c45a25ffbb3996d46b978228e7", "520e23729ba9420da3d177ccdb7fb1f3", "8f5b21d65d86a840a009eead6b8884cc", "b1afdd65bac87ffd1c04793a0ab972aa", "e40c4f069de5d95683ccdb5c0628b2ef", "929dd6c71919f79896296cb65eda4e13", "270f05674eec7cf7e210e76f824a75a1", "65cde6c7994a153c05dfceb3a75e1444", "b970c14d4c6a818744ad4a7bef51bf6b", "5b0c274fb2d42d0fe339a856b07940f5", "4f7f564dc7f7d80b028471774b527606", "40279aac96cb474dd2fa6769c62f5c1c", "79cd654eba56807bc9e5c5c5bb6452ad", "6a5a16d8dee4c928d741590786fb3df6", "6ac1e26c9a4efeacd879fc03608a4381", "3064f6f5b04b9d8c45be299963de41dd", "8c16736ecc39c3b94b01163bf15a45d0", "5b314833ec377a259f4b9c48a1b5c85b", "3257d286a8594c664263cda292951244", "8c7940010a72f0a48a037fe8391cd2fb", "a3da3ef759095cc21e14422e2a14f797", "91cbd62d57c8933f3c411118a81ab04d", "e7cde366b201c84d3e802718fc6642b2", "2d693e4081da35517527806454a563c3", "2b91d8ce1cdbc9a44f71c922f5b4207d", "f7f6b9e9390bb2744290b4673e111022", "472590a92b09bb1250ee5b7b6f209373", "0dc76d5e5fddc6768b1a2090a4afe35f", "f814e597a8c9a33f65061178cb2d7eb4", "c09e67e807d3be0d14695c3060ad7956", "aaa6a9021bffee4f930ae91f32774113", "bb9072b6b0460a5feb96a6a5dad45875", "b5e112417d68ab9bf9bd31655b383318", "b40d9e637e3ce07a3b4054ae7b453e8a", "725276e227259ff5613b7cba51903662", "0624e226b1341db8457aaa3f608370c5", "620c162aec244bc3a42e6daf3786cc18", "138dc09661f886a51b210af6a551487e", "e9a266efc4ec71fddbc4639ac626f23a", "59718af97aa91967dde2285c5aa4d736", "994fabe27b2d38152d5a1bb6d5e8de39", "aa271d610c9fbfda90456e83014a1219", "7df2d0d36b5a6445909430c96c54137f", "adc50317bed7fc028d3f8606653b692e", "ae044a61dbff57608bf4d7796b093246", "2bcbf73992b52b6ec3d5ee2f42242710", "2532497bca563bd2aa7887616e49cd5b", "5d34e01aa0f25ed30278518756f14c5f", "6a8223c80f24b9c2056dc23e093d36dd", "a524ca620432264e8f3343ef14062dea", "9c742c873dce4df4a949930238d3cbde", "031d5e6b1ba8b705de216ce2ee738a03", "db080178c87a02266d23f07cd72d30b2", "6a8b7f6159e4e7b3abbf7cf7c46caa46", "513e62c2e1554a9ca393bb12eee5b76f", "468b1f4d1faf4a5598e3f4bf356ea1e5", "df2f90e09069dd13d87da3ba152123aa", "4010caafe71464630760391f1652046b", "2d2d3268e83a8caccada4c0cd60a66ad", "8a54a27a27bba973b1dbee516de4a9f2", "3f132456a2ec89cc2e8b3a49fca1e74a", "bb6db2432a7d440fb326e3c7ba0aa023", "19342db445a0ba93a98d1c4c351f3e0c", "0d8e9aab1b701c0420af4781f391576a", "8f009e68251be9ad2603b19f8dec849d", "a0d0614e9e0f4cdec2175ce89b094fca", "520a4d6fec68a28dbe13accb42a1a8a4", "46bdd9a605401074703cd2c101b44337", "7f89e8ee473955c9e7606eeb9415181f", "79d5a69c0c2fe77163f16ba16d810730", "1c0adfdbdcda89c4c0472be4a6b36f0b", "f08c5aab42cf9a558b6307410f9a12f8", "8dd062f4abbfd07b70cb15b0da28fa18", "17cd1e38c99b871a9620ec6e5c975bba", "8bea0e5fec7e5ae7240ac623a3fa6edb", "dc7ea38698fccd066e69004790ea85c9", "d89148dce284949777d4704c68142cc4", "f155484e815bf4a2d534ebe5f06a8ed1", "899256cc9e3a6ab8a721855b4793bc98", "267a605fa69b010603d7a7dbc9ac5a34", "b557d839da1e194baf75ed792eb21004", "6f4663b4a10be5938e29163078d06141", "cc9a2beceab88f135bad825bc50f2d6a", "226e26f0f1223b6d96df0a04bef136e9", "aa94852f8fb947af1b454b18c61ac4e7", "89ba36df96007c7f24173936a64f2093", "d361afb95b321792bf485431c6387c7c"];

function FormatBMSTables(bmsTables) {
	return bmsTables.map(e => `${e.table}${e.level}`).join(", ");
}

if (require.main === module) {
	(async () => {
		// THE JSON SENT OVER THE WIRE IS INVALID!
		// We have to strip a Byte Order Mark ourselves. Why? No idea.
		// This is illegal JSON. How do people keep messing up such a simple format?
		const text = await fetch(tableInfo.data_url).then(r => r.text());

		const data = JSON.parse(text.split(/^\uFEFF/)[1])

		const charts = [];
		const songs = [];

		const existingMD5s = new Set(ReadCollection("charts-pms.json").map(e => e.data.hashMD5));

		let i = 1;
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
					tableString: FormatBMSTables([{
						table: tableInfo.symbol,
						level: d.level
					}])
				},
			}

			let l = Number(d.level);

			let tierlistInfo = Number.isNaN(l) ? {} : {
				"sgl-EC": MakeTierlistStuff(l),
				"sgl-HC": MakeTierlistStuff(l),
			}

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
							level: d.level
						}
					]
				},
				versions: []
			}

			i++;

			songs.push(song);
			charts.push(chart);
			charts.push(Object.assign({}, chart, { chartID: CreateChartID(), playtype: "Keyboard" }))
		}

		MutateCollection("songs-pms.json", () => {
			return songs;
		})

		MutateCollection("charts-pms.json", () => {
			return charts;
		})
	})();
}

function MakeTierlistStuff(l) {
	const value = ConvertLevel(l);

	return {
		value,
		text: value <= 50 ? "○" + value.toString() : "●" + l,
		individualDifference: false,
	}
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
	}[i]
}