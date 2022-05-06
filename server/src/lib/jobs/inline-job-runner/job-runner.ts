import { BacksyncBMSPMSSongsAndCharts } from "../backsync-bms-pms-data";
import { DeoprhanScores } from "../deorphan-scores";
import { UGSSnapshot } from "../ugs-snapshot";
import { UpdatePoyashiData } from "../update-bpi-data";
import { UpdateDPTiers } from "../update-dp-tiers";
import { Queue, Worker } from "bullmq";
import CreateLogCtx from "lib/logger/logger";
import { TachiConfig } from "lib/setup/config";
import { DedupeArr } from "utils/misc";

interface Job {
	name: string;
	cronFormat: string;
	run: () => Promise<void>;
}

const jobs: Array<Job> = [
	{
		name: "Snapshot User Game Stats",
		cronFormat: "0 0 * * *",
		run: UGSSnapshot,
	},
	{
		name: "De-Orphan Scores",

		// We run an hour after snapshotting UGS
		// just to spread load out a bit.
		cronFormat: "1 0 * * *",
		run: DeoprhanScores,
	},
];

// if kamaitachi or omnitachi
if (TachiConfig.TYPE !== "btchi") {
	jobs.push({
		name: "Update BPI",
		cronFormat: "2 0 * * *",
		run: UpdatePoyashiData,
	});
	jobs.push({
		name: "Update DP Tiers",
		cronFormat: "3 0 * * *",
		run: UpdateDPTiers,
	});
}

// if bokutachi or omnimitachi
if (TachiConfig.TYPE !== "ktchi") {
	jobs.push({
		name: "Backsync BMS + PMS",
		cronFormat: "2 0 * * *",
		run: BacksyncBMSPMSSongsAndCharts,
	});
}

const logger = CreateLogCtx("JOB_RUNNER");

/**
 * Initalises a tachi-server job runner.
 * This runs the list of jobs defined in jobConfig.jobs.
 */
export function InitialiseJobRunner() {
	logger.info(`Booting up Job Runner.`);

	const names = jobs.map((e) => e.name);

	if (DedupeArr(names).length !== names.length) {
		logger.crit(`Jobs has duplicate name fields, refusing to run.`);
		process.exit(1);
	}

	const JobQueue = new Queue("Job Runner");

	const jobNameMap = new Map<string, Job>();

	for (const job of jobs) {
		JobQueue.add(job.name, { jobName: job.name }, { repeat: { cron: job.cronFormat } });
		jobNameMap.set(job.name, job);
	}

	new Worker("Job Runner", async (j) => {
		const name = j.data.jobName;

		logger.info(`Running job ${name}.`);

		const jobInfo = jobNameMap.get(name);

		if (!jobInfo) {
			logger.severe(`Unknown job name ${name}, couldn't find a run function?`);
			return false;
		}

		await jobInfo.run();

		return true;
	});

	logger.info(`Initialised ${jobs.length} jobs (${jobs.map((e) => e.name).join(", ")}).`);
}

if (require.main === module) {
	InitialiseJobRunner();
}
