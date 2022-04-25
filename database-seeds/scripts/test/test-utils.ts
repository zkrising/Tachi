import { SCHEMAS } from "tachi-common/js/lib/schemas";

const songFormat = (s) => `${s.artist} - ${s.title} (${s.id})`;
const chartFormat = (s) => `${s.id} - ${s.playtype} ${s.difficulty} (${s.chartID})`;

export const FormatFunctions: Partial<Record<keyof typeof SCHEMAS, (d) => string>> = {
	"bms-course-lookup": (d) => d.title,
	folders: (d) => d.title,
	tables: (d) => d.name,
	"songs-bms": songFormat,
	"songs-chunithm": songFormat,
	"songs-iidx": songFormat,
	"songs-jubeat": songFormat,
	"songs-maimai": songFormat,
	"songs-museca": songFormat,
	"songs-pms": songFormat,
	"songs-popn": songFormat,
	"songs-sdvx": songFormat,
	"songs-usc": songFormat,
	"songs-wacca": songFormat,
	"charts-bms": chartFormat,
	"charts-chunithm": chartFormat,
	"charts-iidx": chartFormat,
	"charts-jubeat": chartFormat,
	"charts-maimai": chartFormat,
	"charts-museca": chartFormat,
	"charts-pms": chartFormat,
	"charts-popn": chartFormat,
	"charts-sdvx": chartFormat,
	"charts-usc": chartFormat,
	"charts-wacca": chartFormat,
};
