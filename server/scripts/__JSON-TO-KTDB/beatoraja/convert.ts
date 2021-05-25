/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

// @ts-nocheck
// yeah, this script is old and wrote in JS. what of it.
const path = require("path");
const sqlDB = require("better-sqlite3")(path.join(__dirname, "songdata.db"));
const fs = require("fs");

console.log("Connecting to database...");
console.time("DB CONNECT TIME");
const crypto = require("crypto");

const ktchiSongs = [];
const ktchiCharts = [];

const stmt = sqlDB.prepare("SELECT * FROM song");

let freeSongID = 1;

const DIFFICULTY_LOOKUP = ["CUSTOM", "BEGINNER", "NORMAL", "HYPER", "ANOTHER", "CUSTOM"];

const PLAYTYPE_LOOKUP = {
    7: "7K",
    14: "14K",
    5: "5K",
    10: "10K",
};

for (const song of stmt.iterate()) {
    const playtype = PLAYTYPE_LOOKUP[song.mode.toString()];

    const songID = freeSongID;
    const chartID = crypto.randomBytes(20).toString("hex");

    let difficulty = DIFFICULTY_LOOKUP[song.difficulty];

    freeSongID++;

    if (!difficulty) {
        console.log(song.difficulty);
        difficulty = "CUSTOM"; // fuck it and fuck you, you bitch.
    }

    const ktchiChart = {
        songID,
        chartID: chartID,
        rgcID: null,
        data: {
            notecount: song.notes,
            hashMD5: song.md5,
            hashSHA256: song.sha256,
        },
        level: "?",
        levelNum: 0,
        difficulty,
        playtype,
        isPrimary: true,
        versions: [],
    };

    const ktchiSong = {
        id: songID,
        title: song.title,
        artist: song.artist,
        firstVersion: null,
        data: {
            subtitle: song.subtitle || null,
            subartist: song.subartist || null,
            genre: song.genre || null,
        },
        "search-titles": [],
        "alt-titles": [],
    };

    ktchiSongs.push(ktchiSong);
    ktchiCharts.push(ktchiChart);
}

console.log("done");

fs.writeFileSync(path.join(__dirname, "songs.json"), JSON.stringify(ktchiSongs));
fs.writeFileSync(path.join(__dirname, "charts.json"), JSON.stringify(ktchiCharts));

console.log("postwrite");
