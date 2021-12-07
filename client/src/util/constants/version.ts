const MAJOR = 2;
const MINOR = 0;
const PATCH = 1;

// As is with all front-facing zkldi projects, the version names for tachi-client
// are from an album I like. In this case, the album is The Cure - Disintegration.

const THE_CURE_DISINTEGRATION = [
	"Plainsong", // v2.0.0
	"Pictures Of You", // v2.1.0
	"Closedown", // v2.2.0
	"Lovesong", // v2.3.0
	"Last Dance", // v2.4.0
	"Lullaby", // v2.5.0
	"Fascination Street", // v2.6.0
	"Prayers For Rain", // v2.7.0
	"The Same Deep Water As You", // v2.8.0
	"Disintegration", // v2.9.0
	"Homesick", // v2.10.0
	// v2.11+ onwards are not expected to occur, but if they do, we'll figure something out.
];

export const VERSION_INFO = {
	major: MAJOR,
	minor: MINOR,
	patch: PATCH,
	name: THE_CURE_DISINTEGRATION[MINOR],
};

export const VERSION_STR = `${MAJOR}.${MINOR}.${PATCH}`;

export const FORMATTED_VERSION = `v${VERSION_STR} (${VERSION_INFO.name})`;
