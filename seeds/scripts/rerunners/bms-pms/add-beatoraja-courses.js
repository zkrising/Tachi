const { MutateCollection } = require("../../util");
const fetch = require("node-fetch");

const { Command } = require("commander");

const program = new Command();
program
	.option("-u, --url <header url>")
	.option("-p, --playtype <7K|14K>")
	.option("-s, --set <genocideDan | stslDan | lnDan>")
	.option("-i, --index <start index>");

program.parse(process.argv);
const options = program.opts();

if (
	!options.url ||
	!["7K", "14K"].includes(options.playtype) ||
	!options.set ||
	Number.isNaN(Number(options.index))
) {
	throw new Error(`Missing parameters.`);
}

(async () => {
	const data = await fetch(options.url).then((r) => r.json());

	MutateCollection("bms-course-lookup.json", (courses) => {
		const existingCourses = new Set(courses.map((e) => e.md5sums));

		let i = 0;
		for (const d of data.course[0]) {
			const md5sums = d.md5.join("");
			if (existingCourses.has(md5sums)) {
				continue;
			}

			courses.push({
				title: d.name,
				md5sums,
				set: options.set,
				playtype: options.playtype,
				value: Number(options.index) + i,
			});

			i++;
		}

		return courses;
	});
})();
