import monk from "monk";
import fs from "fs";
import path from "path";

const ktBlackDB = monk(`${process.env.MONGO_BASE_URL}/ktblackdb`);

(async () => {
    let songs = await ktBlackDB.get("songs-iidx").find({}, { projection: { _id: 0 } });

    fs.writeFileSync(
        path.join(__dirname, "../test-utils/test-data/kamaitachi/ktblack-songs-iidx.json"),
        JSON.stringify(songs)
    );
})();
