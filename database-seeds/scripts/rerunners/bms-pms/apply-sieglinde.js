const { Command } = require("commander");
const fs = require("fs");
const path = require("path");
const { MutateCollection } = require("../../util");

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

function fmtSgl(sgl) {
	if (sgl < 13) {
		return `☆${sgl.toFixed(2)}`;
	}

	return `★${(sgl - 12).toFixed(2)}`;
}

function sl12Fix(x) {
	const v0 = 19 + 12;
	const v1 = 21 + 12;
	const max = 35.98053547;

	if (x < v0) {
		return x;
	}

	const diffToMax = (x - v0) / (max - v0);

	// rescale v0 -> max to v0 -> v1, lerp appropriately.
	return v0 + diffToMax * (v1 - v0);
}

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

				// sl12 data is screwed, neuter it.
				if (maybeSgl.baseLevel === "sl12") {
					maybeSgl.ec = sl12Fix(maybeSgl.ec);
					maybeSgl.hc = sl12Fix(maybeSgl.hc);

					maybeSgl.ecStr = fmtSgl(maybeSgl.ec);
					maybeSgl.hcStr = fmtSgl(maybeSgl.hc);
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
