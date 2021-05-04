import db from "../../src/db/db";
import { FolderDocument } from "kamaitachi-common";

(async () => {
    let folders = (await db.folders.find({})) as any[];

    for (const fl of folders) {
        let f: FolderDocument = {
            folderID: fl.folderID,
            game: fl.game,
            playtype: fl.playtype,
            table: fl.table,
            tableIndex: fl.tableIndex,
            title: fl.title,
            type: fl.query.collection === "charts" ? "charts" : "songs",
            data: fl.query.body,
        };

        await db.folders.update(
            {
                _id: fl._id,
            },
            { $set: f }
        );
    }

    console.log("done");
})();
