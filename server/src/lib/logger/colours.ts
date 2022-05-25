const Colours = {
	crit: ["bgRed", "black"],
	severe: ["bgBrightRed", "black"],
	error: ["red"],
	warn: ["yellow"],
	info: ["blue"],
	verbose: ["cyan"],
	debug: ["white"],
};

// Discord ONLY accepts decimal colours, so.
// lets run with that.
export const DiscordColours = {
	// #ff0000
	crit: 16711680,

	// #ff3333
	severe: 16719904,

	// #cc0000
	error: 11730944,

	// #ffcc00
	warn: 16703232,

	// other log colours don't matter -- they can all default to gray
};

export default Colours;
