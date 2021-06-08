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
    "Mysterons",
    "Sour Times",
    "Strangers",
    "It Could Be Sweet",
    "Wandering Star",
    "It's a Fire",
    "Numb",
    "Roads",
    "Pedestal",
    "Biscuit",
    "Glory Box",
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
