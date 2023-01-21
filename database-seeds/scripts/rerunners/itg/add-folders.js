const { CreateFolderID, MutateCollection } = require("../../util");

const folders = [];

for (let i = 1; i < 40; i++) {
	const levelFolders = [
		{
			type: "charts",
			data: {
				"data¬rankedLevel": i,
			},
			title: `Level ${i} Ranked`,
			game: "itg",
			playtype: "Stamina",
			inactive: false,
			searchTerms: [],
		},
		{
			type: "charts",
			data: {
				"data¬chartLevel": i,
			},
			title: `Level ${i} (w/ Unranked)`,
			game: "itg",
			playtype: "Stamina",
			inactive: false,
			searchTerms: [],
		},
		{
			type: "charts",
			data: {
				"data¬rankedLevel": i,
				"data¬length": { "~gte": 60 * 16 },
			},
			title: `Level ${i} (Ranked Marathons)`,
			game: "itg",
			playtype: "Stamina",
			inactive: false,
			searchTerms: [],
		},
		{
			type: "charts",
			data: {
				"data¬chartLevel": i,
				"data¬length": { "~gte": 60 * 16 },
			},
			title: `Level ${i} (All Marathons)`,
			game: "itg",
			playtype: "Stamina",
			inactive: false,
			searchTerms: [],
		},
	];

	for (const fld of levelFolders) {
		fld.folderID = CreateFolderID(fld.data, fld.game, fld.playtype);
	}

	folders.push(...levelFolders);
}

MutateCollection("folders.json", (v) => [...v, ...folders]);

MutateCollection("tables.json", (tbls) => {
	tbls.push({
		tableID: "itg-Stamina-ranked",
		game: "itg",
		playtype: "Stamina",
		title: `ITG Stamina Ranked`,
		description: `Ranked charts for ITG. These are more reliably accurately rated than trusting what the charter thinks.`,
		folders: folders
			.filter((e) => "data¬rankedLevel" in e.data && !("data¬length" in e.data))
			.map((e) => e.folderID),
		inactive: false,
		default: true,
	});

	tbls.push({
		tableID: "itg-Stamina-any",
		game: "itg",
		playtype: "Stamina",
		title: `ITG Stamina (w/ Unranked)`,
		description: `All charts for ITG. These may not be accurately rated.`,
		folders: folders
			.filter((e) => "data¬chartLevel" in e.data && !("data¬length" in e.data))
			.map((e) => e.folderID),
		inactive: false,
		default: false,
	});

	tbls.push({
		tableID: "itg-Stamina-marathon-ranked",
		game: "itg",
		playtype: "Stamina",
		title: `ITG Stamina Ranked Marathons`,
		description: `Ranked marathons for ITG. These are more reliably accurately rated than trusting what the charter thinks.`,
		folders: folders
			.filter((e) => "data¬rankedLevel" in e.data && "data¬length" in e.data)
			.map((e) => e.folderID),
		inactive: false,
		default: true,
	});

	tbls.push({
		tableID: "itg-Stamina-marathon-any",
		game: "itg",
		playtype: "Stamina",
		title: `ITG Stamina Marathons (w/ Unranked)`,
		description: `All marathons for ITG. These may not be accurately rated.`,
		folders: folders
			.filter((e) => "data¬chartLevel" in e.data && "data¬length" in e.data)
			.map((e) => e.folderID),
		inactive: false,
		default: false,
	});

	return tbls;
});
