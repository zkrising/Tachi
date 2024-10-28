import {XMLParser} from "fast-xml-parser";
import fs from "fs";
import {Music, parseGameData} from "./parse-gameData";

const parser = new XMLParser();

const gameData: Music[] = parser.parse(fs.readFileSync("musicdb.xml")).mdb.music;

parseGameData("world", gameData);
