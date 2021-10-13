import Queue from "bull";
import CreateLogCtx from "lib/logger/logger";
import { DedupeArr } from "utils/misc";
import { DeoprhanScores } from "./jobs/deorphan-scores";
import { UGSSnapshot } from "./jobs/ugs-snapshot";

interface Job {
	name: string;
	cronFormat: string;
	run: (job: Queue.Job) => Promise<void>;
}

const jobs: Job[] = [
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
		JobQueue.add({ jobName: job.name }, { repeat: { cron: job.cronFormat } });
		jobNameMap.set(job.name, job);
	}

	JobQueue.process(async (j) => {
		const name = j.data.jobName;
		logger.info(`Running job ${name}.`);

		const jobInfo = jobNameMap.get(name);

		if (!jobInfo) {
			logger.severe(`Unknown job name ${name}, couldn't find a run function?`);
			return false;
		}

		await jobInfo.run(j);

		return true;
	});

	logger.info(`Initialised ${jobs.length} jobs.`);
}

if (require.main === module) {
	InitialiseJobRunner();
}
