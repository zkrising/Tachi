import fs from "fs";
import {Music, parseGameData} from "./parse-gameData";

interface JsonMusic {
	mcode: number,
	basename: string,
	title: string,
	title_sort: string,
	artist: string,
	bpmmax: number,
	bpmmin: number,
	level_str: string,
	editable: boolean,
	seriesid: number,
	ac_seriesid: number,
	limited_cha: number,
	bemaniflag: number,
}

function jsonMusicToMusic(jsonMusic: JsonMusic): Music {
	return {
		mcode: jsonMusic.mcode,
		basename: jsonMusic.basename,
		title: jsonMusic.title,
		title_yomi: jsonMusic.title_sort,
		artist: jsonMusic.artist,
		bpmmax: jsonMusic.bpmmax,
		series: jsonMusic.ac_seriesid,
		bemaniflag: jsonMusic.bemaniflag,
		limited_cha: jsonMusic.limited_cha,
		diffLv: jsonMusic.level_str,
	}
}

const gameData = JSON.parse(fs.readFileSync("music.json", "utf-8")).map(jsonMusicToMusic);

parseGameData("konaste", gameData);
