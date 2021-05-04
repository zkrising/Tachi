import db from "../../src/db/db";

(async () => {
    db.folders
        .find({})
        // @ts-expect-error ??? monk
        .each(async (c, { pause, resume }) => {
            pause();

            await db.folders.update(
                {
                    _id: c._id,
                },
                {
                    $set: {
                        tableIndex: Number(c.tableIndex),
                    },
                }
            );

            resume();
        })
        .then(() => console.log("done"));
})();
