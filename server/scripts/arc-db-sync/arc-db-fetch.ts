import { Command } from "commander";
import CreateLogCtx from "../../src/common/logger";
import fetch from "../../src/common/fetch";
import fs from "fs";
import path from "path";

// note - this program was never run due to WSL2 errors
// causing network requests to screech to a halt.

const logger = CreateLogCtx(__filename);

const program = new Command();

program.option("-u, --url <URL>", "The base URL to sync from.");
program.option("-b, --bearer <token>", "The authorization bearer token to use.");

program.parse(process.argv);
const options = program.opts();

async function GetIIDXSongs() {
    const allSongs = [];

    let url = `https://${options.url}/api/v1/iidx/27/music/`;

    let moreData = true;
    while (moreData) {
        // eslint-disable-next-line no-await-in-loop
        const songs = await fetch(url, {
            headers: {
                Authorization: `Bearer ${options.bearer}`,
            },
        }).then((r) => r.json());

        if (songs._links._next) {
            url = songs._links._next;
        } else {
            moreData = false;
        }

        allSongs.push(...songs._items);
    }

    fs.writeFileSync(path.join(__dirname, "./songs.json"), JSON.stringify(allSongs));
}

async function GetCharts() {
    const songs = JSON.parse(fs.readFileSync(path.join(__dirname, "./songs.json"), "utf-8"));

    logger.info("Parsed songs.json");

    const allCharts: any[] = [];
    const failed: any[] = [];

    async function DoStuff(song: any) {
        try {
            logger.info(
                `Starting Request https://${options.url}/api/v1/iidx/27/charts/?music_id=${song._id}&omnimix=true.`
            );

            // eslint-disable-next-line no-await-in-loop
            const charts = await fetch(
                `https://${options.url}/api/v1/iidx/27/charts/?music_id=${song._id}&omnimix=true`,
                {
                    headers: {
                        Authorization: `Bearer ${options.bearer}`,
                    },
                }
            ).then((r) => r.json());

            logger.info(`Parsed: ${charts._related.music[0].title}`);

            allCharts.push(charts);
        } catch (err) {
            logger.error(song);
            logger.error(err);
            failed.push(err);
        }
    }

    const promises = songs.map((s: any) => DoStuff(s));

    await Promise.all(promises);

    fs.writeFileSync(path.join(__dirname, "./charts.json"), JSON.stringify(allCharts));

    logger.info(failed);

    logger.info("done?");
}

GetCharts();
