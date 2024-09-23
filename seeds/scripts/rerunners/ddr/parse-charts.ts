import fs from "fs";
import {Parser} from "binary-parser";
import {ReadCollection, WriteCollection} from "../../util";
import {ChartDocument, SongDocument} from "tachi-common";

const STEP_HEADER_LENGTH = 6;

class StepData {
    style: string;
    difficulty: string;
    steps: number;

    constructor(style: string, difficulty: string, steps: number) {
        this.style = style;
        this.difficulty = difficulty;
        this.steps = steps;
    }
}

class SSQParser {
    private TempoChanges = new Parser()
        .endianness("little")
        .uint16("ticksPerSecond")
        .uint16("offsetCount")
        .uint16("tempoIgnoredParam")
        .array("timeOffsets", {
            type: "int32le",
            length: "offsetCount",
        })
        .array("data", {
            type: "int32le",
            length: "offsetCount",
        });

    private Configurations = new Parser()
        .endianness("little")
        .uint16("configIgnoredParam1")
        .uint16("configCount")
        .uint16("configIgnoredParam2")
        .array("configOffsets", {
            type: "uint32le",
            length: "configCount",
        })
        .array("data", {
            type: "uint16le",
            length: "configCount",
        });

    private StepsExtraData = new Parser().endianness("little").uint8("panels").uint8("type");

    private Steps = new Parser().endianness("little").wrapped("buffer", {
        length: function (this: any, item) {
            return this.$parent.size - STEP_HEADER_LENGTH;
        },
        wrapper: (buffer) => buffer,
        type: new Parser()
            .endianness("little")
            .uint8("style")
            .uint8("difficulty")
            .uint16("stepCount")
            .uint16("stepsIgnoredParam")
            .array("measures", {
                type: "uint32le",
                length: "stepCount",
            })
            .array("steps", {
                type: "uint8",
                length: "stepCount",
            })
            .buffer("ignoredBufferBeforeExtraData", {
                readUntil: (item, buffer) => {
                    return buffer[0] !== 0;
                },
            })
            .array("stepsExtraData", {
                type: this.StepsExtraData,
                readUntil: "eof",
            }),
    });
    private Ignored = new Parser().endianness("little").seek(function (this: any, item) {
        return this.$parent.size - STEP_HEADER_LENGTH;
    });
    private EndOfFile = new Parser().endianness("little").array("end", {
        type: "uint8",
        readUntil: "eof",
    });

    private Chunk = new Parser()
        .useContextVars()
        .endianness("little")
        .uint32("size")
        .uint16("chunkType")
        .choice("content", {
            tag: "chunkType",
            choices: {
                0: this.EndOfFile, // Hacky way to ignore end of file, probably
                1: this.TempoChanges, // TempoChanges
                2: this.Configurations, // Configurations
                3: this.Steps, // Steps. What we really need.
                4: this.Ignored, // Background
                5: this.Ignored, // Unknown
                9: this.Ignored, // SongMetadata
                17: this.Ignored, // Wtf is that
            },
        });

    private debugFormatter(item: any) {
        console.dir(item, {maxArrayLength: null, depth: 4});
        return item;
    }

    private ssqFile = new Parser().endianness("little").useContextVars().array("chunks", {
        type: this.Chunk,
        readUntil: function (item, buffer) {
            return buffer.length <= 6;
        },
    });

    private getStyle(style: number) {
        switch (style) {
            case 20:
                return "SP";
            case 24:
                return "DP";
            default:
                return "";
        }
    }

    private getDifficulty(difficulty: number) {
        switch (difficulty) {
            case 1:
                return "BASIC";
            case 2:
                return "DIFFICULT";
            case 3:
                return "EXPERT";
            case 4:
                return "BEGINNER";
            case 6:
                return "CHALLENGE";
            default:
                return "";
        }
    }

    parse(filename: string): StepData[] {
        const fileContent = fs.readFileSync(filename, "hex");
        const byteArray = new Uint8Array(
            fileContent!.match(/.{1,2}/g)!.map((str) => parseInt(str, 16))
        );
        const output = this.ssqFile.parse(byteArray);
        return output.chunks
            .filter((chunk: any) => chunk.chunkType === 3)
            .map((chunk: any) => {
                return new StepData(this.getStyle(chunk.content.buffer.style), this.getDifficulty(chunk.content.buffer.difficulty), chunk.content.buffer.steps.filter(
                    (step: number, i: number, arr: number[]) =>
                        step !== 0 || step === 0 && i > 0 && arr[i - 1] !== 0
                ).length);
            });
    }
}

class DataUpdater {
    songs = ReadCollection("songs-ddr.json");
    existingChartDocs: ChartDocument<"ddr:SP" | "ddr:DP">[] = ReadCollection("charts-ddr.json");

    updateStepCounts(basename: string, stepDataArray: StepData[]) {
        for (const stepData of stepDataArray) {
            const song: SongDocument<"ddr"> = this.songs.find(
                (s: SongDocument<"ddr">) => s.data.basename === basename
            );
            if (!song) break;
            for (const chart of this.existingChartDocs) {
                if (song.id === chart.songID && chart.playtype === stepData.style && chart.difficulty === stepData.difficulty) {
                    console.log(`Mutating chart ${chart.chartID}...`);
                    chart.data.stepCount = stepData.steps;
                }
            }
        }
    }

    saveCharts() {
        // overwrite this collection instead of mutating it
        // we already know the existing chart docs and might have mutated them to
        // declare the new versions, or update chart constants.
        WriteCollection("charts-ddr.json", [...this.existingChartDocs]);
    }
}

const ssqParser = new SSQParser();
const dataUpdater = new DataUpdater();

fs.readdirSync("./ssq/").filter((file) => file.endsWith(".ssq")).forEach((file) => {
    console.log(`Parsing ${file}...`)
    try {
        const stepData = ssqParser.parse(`./ssq/${file}`);
        dataUpdater.updateStepCounts(file.replace(".ssq", ""), stepData);
    } catch (e) {
        console.log(e);
    }
})

dataUpdater.saveCharts();


