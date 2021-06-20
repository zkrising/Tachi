import Prudence, { PrudenceSchema } from "prudence";
import db from "../src/db/db";
import { PRUDENCE_SCORE_SCHEMAS, STATIC_SCHEMAS } from "../src/db/schemas";
import CreateLogCtx from "../src/common/logger";
import fs from "fs";
import path from "path";
import { PrudenceError } from "prudence/js/error";
import { validPlaytypes } from "tachi-common/js/config";
import { CONF_INFO } from "../src/lib/setup/config";

const BASE_DIR = path.join(__dirname, "./validate-database-errs");

// note: a hell of a lot of this code is copy pasted
// this is just a script, so, feel free to refactor it.

const logger = CreateLogCtx(__filename);

async function ValidateStaticSchemas(): Promise<void> {
	for (const x in STATIC_SCHEMAS) {
		const c = x as keyof typeof STATIC_SCHEMAS;

		const schema = STATIC_SCHEMAS[c] as PrudenceSchema;

		logger.info(`=== Validating Collection ${c}... ===`);

		let successCount = 0;
		let total = 0;
		const fails: { err: PrudenceError; doc: unknown }[] = [];

		const start = process.hrtime.bigint();

		// @ts-expect-error shut UP
		// eslint-disable-next-line no-await-in-loop
		await db[c].find({}, { projection: { _id: 0 } }).each((c: unknown) => {
			total++;
			const res = Prudence(c, schema);

			if (res === null) {
				successCount++;
			} else {
				logger.error(res);
				fails.push({ err: res, doc: c });
			}
		});

		const end = process.hrtime.bigint();
		logger.info(`Validated ${total} objects. Took ${Number(end - start) / 1e9} seconds.`);
		logger.info(`Success: ${successCount} (${((successCount * 100) / total).toFixed(2)}%)`);
		logger.info(`Fail: ${fails.length} (${((fails.length * 100) / total).toFixed(2)}%)`);

		if (fails.length !== 0) {
			logger.severe(`Invalid documents found! Please resolve them.`);
			fs.writeFileSync(path.join(BASE_DIR, `${c}.json`), JSON.stringify(fails));
		}
	}

	logger.info("Done!");
	process.exit(0);
}

async function ValidateScores(): Promise<void> {
	const globalStart = process.hrtime.bigint();
	let globalTotal = 0;
	let globalSuccess = 0;
	let globalFail = 0;
	for (const game of CONF_INFO.supportedGames) {
		for (const playtype of validPlaytypes[game]) {
			// @ts-expect-error shut up
			const schema = PRUDENCE_SCORE_SCHEMAS[game][playtype];

			let successCount = 0;
			let total = 0;
			const fails: { err: PrudenceError; doc: unknown }[] = [];

			logger.info(`=== Validating Collection scores (${game} ${playtype}) ... ===`);
			const start = process.hrtime.bigint();

			// eslint-disable-next-line no-await-in-loop
			await db.scores
				.find({ playtype, game }, { projection: { _id: 0 } })
				// @ts-expect-error shut UP
				.each((c: unknown) => {
					total++;
					const res = Prudence(c, schema);

					if (res === null) {
						successCount++;
					} else {
						logger.error(
							`[${game} ${playtype}] [${res.keychain}] ${res.message}: ${res.userVal}`
						);
						fails.push({ err: res, doc: c });
					}
				});

			const end = process.hrtime.bigint();
			logger.info(`Validated ${total} objects. Took ${Number(end - start) / 1e9} seconds.`);
			logger.info(`Success: ${successCount} (${((successCount * 100) / total).toFixed(2)}%)`);
			logger.info(`Fail: ${fails.length} (${((fails.length * 100) / total).toFixed(2)}%)`);

			if (fails.length !== 0) {
				logger.severe(`Invalid documents found! Please resolve them.`);
				fs.writeFileSync(
					path.join(BASE_DIR, `scores-${game}-${playtype}.json`),
					JSON.stringify(fails)
				);
				fs.writeFileSync(
					path.join(BASE_DIR, `scores-${game}-${playtype}.log`),
					`Validated ${total} objects. Took ${
						Number(end - start) / 1e9
					} seconds.\nSuccess: ${successCount} (${((successCount * 100) / total).toFixed(
						2
					)}%)\nFail: ${fails.length} (${((fails.length * 100) / total).toFixed(2)}%)`
				);
			}

			globalTotal += total;
			globalFail += fails.length;
			globalSuccess += successCount;
		}
	}

	const globalEnd = process.hrtime.bigint();
	logger.info(
		`Validated ${globalTotal} objects. Took ${Number(globalEnd - globalStart) / 1e9} seconds.`
	);
	logger.info(`Success: ${globalSuccess} (${((globalSuccess * 100) / globalTotal).toFixed(2)}%)`);
	logger.info(`Fail: ${globalFail} (${((globalFail * 100) / globalTotal).toFixed(2)}%)`);

	// process.exit(1);
}

async function ValidateChartsOrSongs(type: "songs" | "charts"): Promise<void> {
	const globalStart = process.hrtime.bigint();
	let globalTotal = 0;
	let globalSuccess = 0;
	let globalFail = 0;
	for (const game of CONF_INFO.supportedGames) {
		const schema = STATIC_SCHEMAS[type]![game];

		let successCount = 0;
		let total = 0;
		const fails: { err: PrudenceError; doc: unknown }[] = [];

		logger.info(`=== Validating Collection ${type} (${game}) ... ===`);
		const start = process.hrtime.bigint();

		// eslint-disable-next-line no-await-in-loop
		await db[type][game]
			// @ts-expect-error whatever bro
			.find({}, { projection: { _id: 0 } })
			.each((c: unknown) => {
				total++;
				const res = Prudence(c, schema);

				if (res === null) {
					successCount++;
				} else {
					logger.error(`[${game}] [${res.keychain}] ${res.message}: ${res.userVal}`);
					fails.push({ err: res, doc: c });
				}
			});

		const end = process.hrtime.bigint();
		logger.info(`Validated ${total} objects. Took ${Number(end - start) / 1e9} seconds.`);
		logger.info(`Success: ${successCount} (${((successCount * 100) / total).toFixed(2)}%)`);
		logger.info(`Fail: ${fails.length} (${((fails.length * 100) / total).toFixed(2)}%)`);

		if (fails.length !== 0) {
			logger.severe(`Invalid documents found! Please resolve them.`);
			fs.writeFileSync(path.join(BASE_DIR, `${type}-${game}.json`), JSON.stringify(fails));
			fs.writeFileSync(
				path.join(BASE_DIR, `${type}-${game}.log`),
				`Validated ${total} objects. Took ${
					Number(end - start) / 1e9
				} seconds.\nSuccess: ${successCount} (${((successCount * 100) / total).toFixed(
					2
				)}%)\nFail: ${fails.length} (${((fails.length * 100) / total).toFixed(2)}%)`
			);
		}

		globalTotal += total;
		globalFail += fails.length;
		globalSuccess += successCount;
	}

	const globalEnd = process.hrtime.bigint();
	logger.info(
		`Validated ${globalTotal} objects. Took ${Number(globalEnd - globalStart) / 1e9} seconds.`
	);
	logger.info(`Success: ${globalSuccess} (${((globalSuccess * 100) / globalTotal).toFixed(2)}%)`);
	logger.info(`Fail: ${globalFail} (${((globalFail * 100) / globalTotal).toFixed(2)}%)`);
}

// ValidateStaticSchemas();
// ValidateScores();
ValidateChartsOrSongs("charts");
