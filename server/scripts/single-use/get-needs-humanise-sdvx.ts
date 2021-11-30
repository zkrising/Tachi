import db from "external/mongo/db";
import fs from "fs";

(async () => {
	const all = await db.songs.sdvx.find({});

	const humanise = [];
	for (const h of all) {
		if (!h.title.match(/^[a-zA-Z0-9 ().!?-_]*$/)) {
			humanise.push(h);
		}
	}

	fs.writeFileSync(
		"needs-humanise.csv",
		humanise
			.map(
				(e) =>
					`${e.id}, "${e.title.replace('"', '\\"')}", "${e.artist.replace('"', '\\"')}"`
			)
			.join("\n")
	);

	process.exit(0);
})();
