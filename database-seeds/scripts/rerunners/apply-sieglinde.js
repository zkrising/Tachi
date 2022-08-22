const { Command } = require("commander");
const fs = require("fs");
const { MutateCollection } = require("../util");

const program = new Command();
program.option("-d, --data <out.json>");

program.parse(process.argv);
const options = program.opts();

if (!options.data) {
	throw new Error(`Missing --data input.`);
}

const data = JSON.parse(fs.readFileSync(options.data));

MutateCollection("charts-bms.json", (charts) => {
	const sglHashmap = new Map();

	for (const d of data) {
		sglHashmap[d.md5] = d;
	}

	for (const chart of charts) {
		const maybeSgl = sglHashmap[chart.data.hashMD5];

		// patch stuff that falls out of bounds
		if (maybeSgl.ec < 1) {
			maybeSgl.ec = 1;
			maybeSgl.ecStr = "☆1";
		}

		if (maybeSgl.hc < 1) {
			maybeSgl.hc = 1;
			maybeSgl.hcStr = "☆1";
		}

		if (maybeSgl) {
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
