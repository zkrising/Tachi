// The Downward Spiral
// Version Info is intentionally identical between all variants of tachi

export const VERSION_INFO = {
    major: 2,
    minor: 0,
    patch: 0,
    name: "Mr. Self Destruct",
};

export const VERSION_STR = [VERSION_INFO.major, VERSION_INFO.minor, VERSION_INFO.patch].join(".");

export function FormatVersion() {
    const { major, minor, patch, name } = VERSION_INFO;
    return `v${[major, minor, patch].join(".")} (${name})`;
}
