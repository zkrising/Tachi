function FindChartWithPTDFVersion(collection, songID, playtype, difficulty, version) {
	return collection.find(
		(chart) =>
			chart.songID === songID &&
			chart.playtype === playtype &&
			chart.difficulty === difficulty &&
			chart.versions.includes(version)
	);
}

function FindSongWithTitle(collection, title) {
	return collection.find((e) => e.title === title || e.altTitles.includes(title));
}

module.exports = {
	FindSongWithTitle,
	FindChartWithPTDFVersion,
};
