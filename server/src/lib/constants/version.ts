// Note that Version Info is intentionally identical between all variants of tachi
// viz. btchi and ktchi share versioning. This is because they
// essentially share codebases.

const MAJOR = 2;
const MINOR = 0;
const PATCH = 0;

// As is with all front-facing zkldi projects, the version names for tachi-server
// are from an album I like. In this case, the album is Portishead - Dummy.
// The fact that this album is very similar to Mezzanine
// - the album used for Kamaitachi v1 - is deliberate. :) - zkldi
const PORTISHEAD_DUMMY = [
    "Mysterons", // v2.0.0
    "Sour Times", // v2.1.0
    "Strangers", // v2.2.0
    "It Could Be Sweet", // v2.3.0
    "Wandering Star", // v2.4.0
    "It's a Fire", // v2.5.0
    "Numb", // v2.6.0
    "Roads", // v2.7.0
    "Pedestal", // v2.8.0
    "Biscuit", // v2.9.0
    "Glory Box", // v2.10.0
    // v2.11+ onwards are not expected to occur, but if they do, we'll figure something out.
];

export const VERSION_INFO = {
    major: MAJOR,
    minor: MINOR,
    patch: PATCH,
    name: PORTISHEAD_DUMMY[MINOR],
};

export const VERSION_STR = `${MAJOR}.${MINOR}.${PATCH}`;

export function FormatVersion() {
    return `v${VERSION_STR} (${VERSION_INFO.name})`;
}
