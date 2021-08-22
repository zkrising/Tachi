import { Command } from "commander";
import { UpdateTable } from "./table-sync";
import { BMS_TABLES } from "lib/constants/bms-tables";

const program = new Command();
program.option("-t, --table <table>");
program.option("-a, --all");

program.parse(process.argv);
const options = program.opts();

// I have no confidence in half of these links surviving.
// Eventually, some of these are going to disappear, and we'll have to find
// something else. probably.
const registered: any = {
	insane: ["http://www.ribbit.xyz/bms/tables/insane_body.json", BMS_TABLES.insane],
	normal: ["http://www.ribbit.xyz/bms/tables/normal_body.json", BMS_TABLES.normal],
	stella: ["https://stellabms.xyz/st/score.json", BMS_TABLES.stella],
	satellite: ["https://stellabms.xyz/sl/score.json", BMS_TABLES.satellite],
	dpSatellite: ["https://stellabms.xyz/dp/score.json", BMS_TABLES.satellite],
	insane2: ["http://rattoto10.jounin.jp/js/insane_data.json", BMS_TABLES.insane2],
	normal2: ["http://rattoto10.jounin.jp/js/score.json", BMS_TABLES.normal2],
	overjoy: ["http://lr2.sakura.ne.jp/data/score.json", BMS_TABLES.overjoy],
	dpInsane: ["http://dpbmsdelta.web.fc2.com/table/data/insane_data.json", BMS_TABLES.dpInsane],
	dpNormal: ["http://dpbmsdelta.web.fc2.com/table/data/dpdelta_data.json", BMS_TABLES.dpNormal],
};

(async () => {
	if (options.all) {
		for (const table of Object.values(registered)) {
			// eslint-disable-next-line no-await-in-loop
			await UpdateTable((table as any)[1], (table as any)[0]);
		}

		process.exit(0);
	} else {
		const tables = Object.keys(registered);
		if (!tables.includes(options.table)) {
			throw new Error(
				`Invalid table ${options.table} - expected any of ${tables.join(", ")}.`
			);
		}

		await UpdateTable(registered[options.table][1], registered[options.table][0]);

		process.exit(0);
	}
})();
