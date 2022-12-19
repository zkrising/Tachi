/* eslint-disable no-console */
import { ProcessEnv } from "./config";
import { App, createNodeMiddleware } from "@octokit/app";
import express from "express";
import fetch from "node-fetch";
import { URLSearchParams } from "url";

const app = new App({
	appId: ProcessEnv.appId,
	privateKey: ProcessEnv.privateKey,
	webhooks: {
		secret: ProcessEnv.webhookSecret,
	},
	oauth: {
		clientId: ProcessEnv.clientID,
		clientSecret: ProcessEnv.clientSecret,
	},
});

/**
 * Create a response that contains a link to the seeds diff viewer.
 */
function mkSeedDiffViewMsg(repo: string, sha: string, compareRepo: string, compareSHA: string) {
	const params = new URLSearchParams({
		repo: ConvertGitHubURL(repo),
		sha,
		compareRepo: ConvertGitHubURL(compareRepo),
		compareSHA,
	});

	return `\nA commit has changed the database-seeds. [View the seeds diff here.](https://bokutachi.xyz/dashboard/utils/seeds?${params.toString()}`;
}

function ConvertGitHubURL(url: string) {
	return url.replace("https://github.com/", "GitHub:");
}

app.webhooks.on(
	["pull_request.opened", "pull_request.edited"],
	async ({ octokit, payload: body }) => {
		const filesChanged = (await fetch(
			`https://api.github.com/repos/TNG-dev/Tachi/pulls/${body.number}/files`
		).then((r) => r.json())) as Array<{ filename: string }>;

		console.log(`Files Changed: ${filesChanged.map((e) => e.filename).join(", ")}`);

		// if any file modified in this pr is a collection
		if (filesChanged.some((k) => k.filename.startsWith("database-seeds/collections"))) {
			// post a link to the diff viewer in the PR comments.
			const res = await octokit.request(
				"POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
				{
					owner: body.repository.owner.login,
					repo: body.repository.name,
					issue_number: body.pull_request.number,
					body: mkSeedDiffViewMsg(
						body.pull_request.head.repo.url,
						body.pull_request.head.sha,
						body.pull_request.base.repo.url,
						body.pull_request.base.sha
					),
				}
			);

			console.dir(res);
		}
	}
);

const serverMiddleware = createNodeMiddleware(app);

const expressApp = express();

expressApp.use(serverMiddleware);

console.log(`Listening on port ${ProcessEnv.port}.`);
expressApp.listen(ProcessEnv.port);
