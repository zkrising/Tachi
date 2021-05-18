// @ts-nocheck

import db from "../../src/db/db";

db.charts.iidx
    .find({})
    .each(async (c, { pause, resume }) => {
        pause();

        await db.charts.iidx.update(
            { _id: c._id },
            {
                $set: {
                    "flags.2dxtra": false,
                },
            }
        );

        resume();
    })
    .then(() => console.log("done"));
