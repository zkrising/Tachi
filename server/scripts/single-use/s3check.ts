import parser from "fast-xml-parser";
import CreateLogCtx from "../../src/common/logger";
import fs from "fs";
import path from "path";

const logger = CreateLogCtx(__filename);

let parsedXML;

const fileData = fs.readFileSync(
    path.join(__dirname, "../../src/test-utils/test-data/s3/valid.xml"),
    "utf-8"
);

try {
    parsedXML = parser.parse(fileData);
} catch (err) {
    logger.error(err);
}

fs.writeFileSync(path.join(__dirname, "s3data.json"), JSON.stringify(parsedXML, null, 4));
