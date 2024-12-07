const { CreateLogger } = require("mei-logger");
const { ReadCollection, GetFreshSongIDGenerator, CreateChartID, MutateCollection, WriteCollection } = require("../../util");
const songs = require("./data.js");

const DIFFICULTY_MAPPING = {
    "basic": "Basic",
    "advanced": "Advanced",
    "expert": "Expert",
    "master": "Master",
    "remaster": "Re:Master"
};

const logger = CreateLogger("merge-myt");
const existingSongs = ReadCollection("songs-maimaidx.json");
const existingCharts = ReadCollection("charts-maimaidx.json");
const songMap = new Map(existingSongs.map((s) => [s.id, s]));
const chartMap = new Map();
const songTitleArtistMap = new Map();

for (const chart of existingCharts) {
    const song = songMap.get(chart.songID);

	if (song === undefined) {
		logger.error(
			`CONSISTENCY ERROR: Chart ID ${chart.chartID} does not belong to any songs! (songID was ${chart.songID})`
		);
		process.exit(1);
	}

	chartMap.set(`${song.title}-${song.artist}-${chart.difficulty}`, chart);
	songTitleArtistMap.set(`${song.title}-${song.artist}`, song.id);
}

const newSongs = [];
const newCharts = [];
const songIDGenerator = GetFreshSongIDGenerator("maimaidx");

for (const song of songs) {
    const inGameID = song.song_id;

    if (inGameID >= 100000 || inGameID === 445) {
        continue;
    }

    let tachiSongID =
        inGameID === 11422
            ? 959
            : songTitleArtistMap.get(`${song.name}-${song.artist}`);
    
    if (tachiSongID === undefined) {
        tachiSongID = songIDGenerator();

        const songDoc = {
            title: song.name,
            altTitles: [],
            searchTerms: [],
            artist: song.artist,
            id: tachiSongID,
            data: {
                displayVersion: song.version,
                genre: song.category,
            }
        };

        newSongs.push(songDoc);
        songTitleArtistMap.set(`${song.name}-${song.artist}`, tachiSongID);

        logger.info(`Added new song ${song.artist} - ${song.name}`);
    }

    for (const chart of song.charts) {
        if (inGameID == 15 && chart.difficulty == "remaster") {
            continue;
        }

        let difficultyName = DIFFICULTY_MAPPING[chart.difficulty];

        if (difficultyName === undefined) {
            throw new Error(
                `Unknown difficulty name ${chart.difficulty}.`
            );
        }

        if (song.type === "dx") {
            difficultyName = `DX ${difficultyName}`
        }

        let exists;

        if (inGameID === 11422) {
            exists = chartMap.get(`-x0o0x_-${difficultyName}`);
        } else {
            exists = chartMap.get(
                `${song.name}-${song.artist}-${difficultyName}`
            );
        }

        let level = chart.level.toString();
        const levelNum = chart.internal_level;

        if (levelNum >= 7 && levelNum * 10 % 10 >= 6) {
            level += "+";
        }

        if (exists) {
            const displayName = `${song.artist} - ${song.name} [${exists.difficulty}] (${exists.chartID})`;

            if (exists.data.inGameID === null) {
                logger.info(`Adding inGameID ${inGameID} for chart ${displayName}.`);
                exists.data.inGameID = inGameID;
            } else if (exists.data.inGameID !== inGameID) {
                logger.warn(
                    `The chart ${displayName} already exists in charts-maimaidx under a different inGameID (${exists.data.inGameID} != ${inGameID}). Is this a duplicate with a different inGameID?`
                );
            }

            const versionIndex = exists.versions.indexOf("buddiesplus-omni");

            if (versionIndex === -1) {
                exists.versions.push("buddiesplus-omni");
            }

            if (exists.level !== level) {
                logger.info(
                    `Chart ${displayName} has had a level change: ${exists.level} -> ${level}.`
                );
                exists.level = level;
            }

            if (exists.levelNum !== levelNum) {
                logger.info(
                    `Chart ${displayName} has had a levelNum change: ${exists.levelNum} -> ${levelNum}.`
                );
                exists.levelNum = levelNum;
            }

            continue;
        }

        const chartDoc = {
            chartID: CreateChartID(),
            songID: tachiSongID,
            difficulty: difficultyName,
            isPrimary: true,
            level,
            levelNum,
            versions: ["buddiesplus-omni"],
            playtype: "Single",
            data: {
                inGameID,
            },
        };

        newCharts.push(chartDoc);

        logger.info(
            `Inserted new chart ${song.artist} - ${song.name} [${chartDoc.difficulty} ${chartDoc.levelNum}] (${chartDoc.chartID}).`
        );
    }
}

// MutateCollection("songs-maimaidx.json", (songs) => ([...songs, ...newSongs]));
// WriteCollection("charts-maimaidx.json", [...existingCharts, ...newCharts]);
