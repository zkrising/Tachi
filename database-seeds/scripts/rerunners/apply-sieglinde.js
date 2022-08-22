const { Command } = require("commander");
const fs = require("fs");
const path = require("path");
const { MutateCollection } = require("../util");

const program = new Command();
program.option("-i, --input <sieglinde output/ folder>");

program.parse(process.argv);
const options = program.opts();

if (!options.input) {
	throw new Error(`Missing --input.`);
}

const APPLICATION_ORDER = [
	"Normal2",
	"Insane2",
	"Overjoy",
	"Satellite",
	"Stella",
	"Normal",
	"Insane",
];

for (const tableName of APPLICATION_ORDER) {
	const data = JSON.parse(fs.readFileSync(path.join(options.input, `${tableName}.json`)));

	MutateCollection("charts-bms.json", (charts) => {
		const sglHashmap = new Map();

		for (const d of data) {
			sglHashmap[d.md5] = d;
		}

		for (const chart of charts) {
			const maybeSgl = sglHashmap[chart.data.hashMD5];

			if (maybeSgl) {
				// patch stuff that falls out of bounds
				if (maybeSgl.ec < 1) {
					maybeSgl.ec = 1;
					maybeSgl.ecStr = "☆1";
				}

				if (maybeSgl.hc < 1) {
					maybeSgl.hc = 1;
					maybeSgl.hcStr = "☆1";
				}

				// here's a bunch of stupid patches beacuse doing stats properly is for chumps

				// If the chart is rated less than 10, the ec-hc diff is likely nonsensical
				// and massively misrated.
				// hand patch it out
				if (maybeSgl.ec < 10) {
					maybeSgl.hc = maybeSgl.ec;
					maybeSgl.hcStr = maybeSgl.ecStr;
				}

				// overjoy hc data is screwed, disable it for now.
				if (maybeSgl.baseLevel.startsWith("★★")) {
					maybeSgl.hc = 0;
					maybeSgl.hcStr += "?";
				}

				chart.tierlistInfo = {
					"sgl-EC": {
						individualDifference: false,
						text: maybeSgl.ecStr,
						value: maybeSgl.ec,
					},
					"sgl-HC": {
						individualDifference: false,
						text: maybeSgl.hcStr,
						value: maybeSgl.hc,
					},
				};
			}
		}

		return charts;
	});
}
