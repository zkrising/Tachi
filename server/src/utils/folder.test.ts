import t from "tap";
import CreateLogCtx from "../lib/logger/logger";
import { Testing511SPA } from "../test-utils/test-data";
import { ChartDocument, FolderDocument } from "kamaitachi-common";
import {
    CreateFolderChartLookup,
    GetFolderChartIDs,
    GetFolderCharts,
    ResolveFolderToCharts,
} from "./folder";
import db, { CloseMongoConnection } from "../external/mongo/db";
import ResetDBState from "../test-utils/reset-db-state";
import deepmerge from "deepmerge";

const logger = CreateLogCtx(__filename);

t.todo("#CreateFolderChartLookup");
t.todo("#GetFolderCharts");

t.test("#ResolveFolderToCharts", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Static Folder Tests", (t) => {
        t.test("Basic Static", async (t) => {
            const mockFolder = {
                game: "iidx",
                playtype: "SP",
                type: "static",
                data: [Testing511SPA.chartID],
            };

            const { charts } = await ResolveFolderToCharts(mockFolder as FolderDocument);

            t.equal(charts.length, 1, "Should return exactly 1 chart.");
            t.equal(charts[0].chartID, Testing511SPA.chartID, "Should return 511 [SPA]");

            t.end();
        });

        t.test("Empty Static", async (t) => {
            const mockFolder = {
                game: "iidx",
                playtype: "SP",
                type: "static",
                data: [],
            };

            const { charts } = await ResolveFolderToCharts(
                (mockFolder as unknown) as FolderDocument
            );

            t.equal(charts.length, 0, "Should return exactly 0 charts.");

            t.end();
        });

        t.end();
    });

    t.test("Songs Folder Tests", (t) => {
        t.test("Basic Song Query", async (t) => {
            const mockFolder = {
                game: "iidx",
                playtype: "SP",
                type: "songs",
                data: {
                    title: { $regex: /5\.1\.1/u },
                },
            };

            const { charts } = await ResolveFolderToCharts(mockFolder as FolderDocument);

            t.equal(charts.length, 1, "Should return exactly 1 chart.");
            t.equal(charts[0].chartID, Testing511SPA.chartID, "Should return 511 [SPA]");
            t.end();
        });

        t.test("Invalid Song Query", async (t) => {
            const mockFolder = {
                game: "iidx",
                playtype: "SP",
                type: "songs",
                data: {
                    FieldThatDoesntExist: { $regex: /5\.1\.1/u },
                },
            };

            const { charts } = await ResolveFolderToCharts(
                (mockFolder as unknown) as FolderDocument
            );

            t.equal(charts.length, 0, "Should return exactly 0 charts.");
            t.end();
        });

        t.end();
    });

    t.test("Charts Folder Tests", (t) => {
        t.test("Basic Song Query", async (t) => {
            const mockFolder = {
                game: "iidx",
                playtype: "SP",
                type: "charts",
                data: {
                    songID: Testing511SPA.songID, // lol
                },
            };

            const { charts } = await ResolveFolderToCharts(mockFolder as FolderDocument);

            t.equal(charts.length, 1, "Should return exactly 1 chart.");
            t.equal(charts[0].chartID, Testing511SPA.chartID, "Should return 511 [SPA]");
            t.end();
        });

        t.end();
    });

    t.test("Filter", async (t) => {
        // add fake "NORMAL" 511 chart
        await db.charts.iidx.insert(
            deepmerge(Testing511SPA, {
                difficulty: "NORMAL",
                chartID: "FAKE_511_SPN",
            }) as ChartDocument<"iidx:SP">
        );

        const mockFolder = {
            game: "iidx",
            playtype: "SP",
            type: "charts",
            data: {
                songID: Testing511SPA.songID, // lol
            },
        };

        const { charts } = await ResolveFolderToCharts(mockFolder as FolderDocument);

        t.equal(charts.length, 2, "Should return exactly 2 charts.");
        t.strictSame(
            charts.map((e) => e.chartID),
            [Testing511SPA.chartID, "FAKE_511_SPN"],
            "Should return all 511 charts."
        );

        const { charts: charts2 } = await ResolveFolderToCharts(mockFolder as FolderDocument, {
            difficulty: "NORMAL",
        });

        t.equal(charts2.length, 1, "Should return exactly 1 chart.");
        t.equal(charts2[0].chartID, "FAKE_511_SPN", "Should only return 511 SPN");

        t.end();
    });

    t.test("Songs", async (t) => {
        const mockFolder = {
            game: "iidx",
            playtype: "SP",
            type: "charts",
            data: {
                songID: Testing511SPA.songID, // lol
            },
        };

        const { charts, songs } = await ResolveFolderToCharts(
            mockFolder as FolderDocument,
            {},
            true
        );

        t.equal(charts.length, 1, "Should return exactly 1 chart.");
        t.equal(charts[0].chartID, Testing511SPA.chartID, "Should return 511 [SPA]");

        t.equal(songs.length, 1, "Should return exactly 1 song.");
        t.equal(songs[0].id, Testing511SPA.songID, "Should return 511's song.");

        t.end();
    });

    t.end();
});

t.test("#GetFolderChartIDs", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should use the folder-cache", async (t) => {
        await db["folder-chart-lookup"].insert(
            ["a", "b", "c", "d"].map((e) => ({ chartID: e, folderID: "folder1" }))
        );

        await db["folder-chart-lookup"].insert(
            ["e", "f", "g", "h"].map((e) => ({ chartID: e, folderID: "folder2" }))
        );

        let fcIDs = await GetFolderChartIDs("folder1");

        t.strictSame(fcIDs, ["a", "b", "c", "d"], "Should return the right chartIDs for folder1");

        fcIDs = await GetFolderChartIDs("folder2");

        t.strictSame(fcIDs, ["e", "f", "g", "h"], "Should return the right chartIDs for folder2");

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
