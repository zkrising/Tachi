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
	crit: 16711680, // #ff0000
	severe: 16719904, // #ff3333
	error: 11730944, // #cc0000
	warn: 16703232, // #ffcc00
	// other ones dont matter
};
export default Colours;
