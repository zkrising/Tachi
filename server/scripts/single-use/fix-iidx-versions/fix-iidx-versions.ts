import db from "../../../src/db/db";
import { ChartDocument } from "kamaitachi-common";

db.charts.iidx
    .find({})
    // @ts-expect-error it exists
    .each(async (c: ChartDocument<"iidx:SP" | "iidx:DP">, { pause, resume }: any) => {
        pause();

        const song = (await db.songs.iidx.findOne({ id: c.songID }))!;

        let versions = [];

        if (song.firstVersion === "27") {
            versions = ["27", "28", "27-omni", "28-omni"];
        } else if (song.firstVersion === "28") {
            versions = ["28", "28-omni"];
        } else if (song.firstVersion === "inf") {
            versions = ["inf"];
        } else if (song.firstVersion === "inf2020") {
            versions = ["inf2020"];
        } else {
            versions = ["26", "27", "28", "26-omni", "27-omni", "28-omni"];
        }

        await db.charts.iidx.update({ _id: c._id }, { $set: { versions } });

        resume();
    })
    .then(() => console.log("done"));
