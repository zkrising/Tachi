const { MutateCollection } = require("../../util");
const fs = require("fs");
const { XMLParser } = require("fast-xml-parser");

const { Command } = require("commander");

const program = new Command();
program
	.option("-c, --course <.lr2crs file>")
	.option("-p, --playtype <7K|14K>")
	.option("-s, --set <genocideDan | stslDan>")
	.option("-i, --index <start index>");

program.parse(process.argv);
const options = program.opts();

if (
	!options.course ||
	!["7K", "14K"].includes(options.playtype) ||
	!options.set ||
	Number.isNaN(Number(options.index))
) {
	throw new Error(`Missing parameters.`);
}

const parser = new XMLParser();

const data = parser.parse(fs.readFileSync(options.course));

MutateCollection("bms-course-lookup.json", (courses) => {
	const existingCourses = new Set(courses.map((e) => e.md5sums));

	let i = 0;
	for (const d of data.courselist.course) {
		const md5sums = d.hash.slice("00000000002000000000000000000a3a".length);
		if (existingCourses.has(md5sums)) {
			continue;
		}

		courses.push({
			title: d.title,
			md5sums,
			set: options.set,
			playtype: options.playtype,
			value: Number(options.index) + i,
		});

		i++;
	}

	return courses;
});
