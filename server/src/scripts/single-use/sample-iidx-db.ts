import fs from "fs";
import db from "../../db/db";
import path from "path";

(async () => {
    let data = await db.scores.find({ game: "iidx", playtype: "SP" }, { limit: 1000 });
    fs.writeFileSync(path.join(__dirname, "data.json"), JSON.stringify(data));
    process.exit(0);
})();
