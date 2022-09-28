/* eslint-disable no-console */
import { ProcessEnv } from "./config";
import express from "express";
import fetch from "node-fetch";
import { URLSearchParams } from "url";
import type { EmitterWebhookEvent } from "@octokit/webhooks";
import type { Express } from "express";

export const app: Express = express();

app.use(express.json());

// Let NGINX work its magic.
app.set("trust proxy", "loopback");

// Disable query string nesting such as ?a[b]=4 -> {a: {b: 4}}. This
// almost always results in a painful security vuln.
app.set("query parser", "simple");

/**
 * Return the status of this bot and the version it's running.
 *
 * @name GET /
 */
app.get("/", (req, res) =>
	res.status(200).json({
		success: true,
		description: "Github Bot is online!",
		body: {
			time: Date.now(),
		},
	})
);

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

	return `Beep Boop! This change affects \`database-seeds/collections\`. We have a dedicated diff-viewer for this part of the codebase, which makes it easier to view changes.

*****

[View Seeds Diff](https://bokutachi.xyz/dashboard/utils/seeds?${params.toString()}
`;
}

function ConvertGitHubURL(url: string) {
	return url.replace("https://github.com/", "GitHub:");
}

/**
 * Listens for GitHub webhook calls.
 *
 * @name POST /webhook
 */
app.post("/webhook", async (req, res) => {
	console.dir(req.body);

	const event = req.header("X-GitHub-Event");

	if (event !== "pull_request") {
		return res.status(400).json({
			success: false,
			description: `Unsupported Event.`,
		});
	}

	const body = req.body as EmitterWebhookEvent<"pull_request">["payload"];

	if (body.action !== "opened" && body.action !== "edited") {
		return res.status(400).json({
			success: false,
			description: `We only care about opened/edited pull requests!`,
		});
	}

	const filesChanged = (await fetch(
		`https://api.github.com/repos/TNG-dev/Tachi/pulls/${body.number}/files`
	).then((r) => r.json())) as Array<{ filename: string }>;

	// if any file modified in this pr is a collection
	if (filesChanged.some((k) => k.filename.startsWith("database-seeds/collections"))) {
		// post a link to the diff viewer in the PR comments.
		await fetch(body.pull_request._links.comments.href, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${ProcessEnv.clientSecret}`,
			},
			body: JSON.stringify({
				body: mkSeedDiffViewMsg(
					body.pull_request.head.repo.url,
					body.pull_request.head.sha,
					body.pull_request.base.repo.url,
					body.pull_request.base.sha
				),
			}),
		});
	}

	return res.status(200).json({
		success: true,
		description: "Handled request.",
		body: {},
	});
});

/**
 * 404 Handler. If something gets to this point, they haven't matched with anything.
 *
 * @name ALL *
 */
app.all("*", (req, res) =>
	res.status(404).json({
		success: false,
		description: "Nothing found here.",
	})
);

console.log(`Starting express server on port ${ProcessEnv.port}.`);
