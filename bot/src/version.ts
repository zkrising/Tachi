const MAJOR = 2;
const MINOR = 1;
const PATCH = 3;

const TOKYO_SHOEGAZER_MOONDIVER = [
	"Into the Deep Sky",
	"Your Relief",
	"In Full Bloom",
	"Night Dance",
	"Bedtime Story",
	"Moondive",
	"Stay White",
];

export const VERSION_INFO = {
	major: MAJOR,
	minor: MINOR,
	patch: PATCH,
	name: TOKYO_SHOEGAZER_MOONDIVER[MINOR],
};

export const VERSION_STR = `${MAJOR}.${MINOR}.${PATCH}`;

export const VERSION_PRETTY = `v${VERSION_STR} (${VERSION_INFO.name})`;
