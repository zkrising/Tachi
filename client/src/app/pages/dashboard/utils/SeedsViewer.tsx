import { FormatTime } from "util/time";
import { APIFetchV1 } from "util/api";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import Select from "components/util/Select";
import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import { SetState } from "types/react";
import { TachiConfig } from "lib/config";
import ExternalLink from "components/util/ExternalLink";

export default function SeedsViewer() {
	useSetSubheader(["Developer Utils", "Database Seeds Management"]);

	const { data, error: failedToGetLocalAPI } = useApiQuery<Record<string, never>>("/seeds");

	if (!data) {
		return <Loading />;
	}

	return (
		<>
			<h1>{TachiConfig.name} Database Management</h1>
			<Divider />
			<span>
				This tool is for viewing the database that powers {TachiConfig.name} in a more
				efficient manner.
				<br />
				To view the state of a given commit or repository, use the select boxes below.
				<br />
				For more information what all of this is about and how it works, see{" "}
				<ExternalLink href="https://docs.bokutachi.xyz/contributing/components/seeds">
					the documentation
				</ExternalLink>
				.
				{!failedToGetLocalAPI && (
					<>
						<br />
						<br />
						<b>
							Also, it seems like you're running {TachiConfig.name} in local
							development!
						</b>{" "}
						<br />
						You can use this UI to view your current changes on-your-disk before you
						commit them!
					</>
				)}
			</span>
			<Divider />
			<InnerSeedsViewer hasLocalAPI={!failedToGetLocalAPI} />
		</>
	);
	// return <BMSCourseLookupTable dataset={} />;
}

function InnerSeedsViewer({ hasLocalAPI }: { hasLocalAPI: boolean }) {
	const { repo: initRepo } = useParams<{
		repo: string | undefined;
	}>();

	// a repo is one of the following:
	// null - nothing has been selected yet
	// "local" - we're referring to the files on the local development disk
	// "gh:NAME/REPO" - we're referring to a repository on github, like gh:TNG-Dev/Tachi
	const [repo, setRepo] = useState(initRepo ?? null);

	// A revision is any valid pointer to a commit that Github understands.
	const [rev, setRev] = useState<GitCommit | null>(null);

	return (
		<Row>
			<Col xs={12} lg={6} className="offset-lg-3 text-center">
				<div>
					<span style={{ fontSize: "large" }}>Repository:</span>
					<Select
						style={{ display: "inline", width: "unset" }}
						className="mx-2"
						value={repo}
						setValue={setRepo}
						allowNull
					>
						{hasLocalAPI && <option value="local">Your Local Repo</option>}
					</Select>
					{rev && (
						<>
							<span>/</span>
							{rev.sha}
						</>
					)}
				</div>
			</Col>
			<Col xs={12} lg={10} className="offset-lg-1 text-center">
				{repo && !rev && (
					<>
						<Divider />
						<RevSelector repo={repo} setRev={setRev} />
					</>
				)}
			</Col>
		</Row>
	);
}

// stolen straight from server/src/utils/git.ts
interface GitCommit {
	sha: string;
	commit: {
		author: {
			name: string;
			email: string;
			date: string;
		};
		committer: {
			name: string;
			email: string;
			date: string;
		};
		message: string;
	};
}

function RevSelector({ repo, setRev }: { repo: string; setRev: SetState<GitCommit | null> }) {
	const [revs, setRevs] = useState<Array<GitCommit>>([]);

	useEffect(() => {
		(async () => {
			if (repo.startsWith("gh:")) {
				throw new Error("Unsupported...");
			} else {
				// local
				const res = await APIFetchV1<Array<GitCommit>>("/seeds/commits");

				if (!res.success) {
					throw new Error(`Failed to fetch commits? ${res.description}`);
				}

				setRevs(res.body);
			}
		})();
	}, [repo]);

	return (
		<div className="timeline timeline-2">
			<div className="timeline-bar"></div>
			{revs.map((r) => (
				<Revision key={r.sha} rev={r} setRev={setRev} />
			))}
		</div>
	);
}

function Revision({ rev, setRev }: { rev: GitCommit; setRev: SetState<GitCommit | null> }) {
	const authorNotCommitter = rev.commit.author.email !== rev.commit.committer.email;

	// if there's a body then there's two newlines.
	const [subject, _gap, ...maybeBodies] = rev.commit.message.split("\n");

	const [showBody, setShowBody] = useState(false);

	const body: string | undefined = maybeBodies?.join("\n");

	return (
		<div className="timeline-item">
			<span className="timeline-badge bg-primary"></span>
			<div className="timeline-content d-flex align-items-center justify-content-between">
				<div className="mr-3" style={{ width: "50%", textAlign: "left" }}>
					<span style={{ fontSize: "1.15rem" }}>
						<code>{rev.sha}</code>:{" "}
						<a className="gentle-link" onClick={() => setRev(rev)}>
							{subject}
						</a>
					</span>
					{body && (
						<span
							className="ml-4 badge badge-secondary"
							onClick={() => setShowBody(!showBody)}
						>
							{showBody ? (
								<Icon style={{ fontSize: "0.7rem" }} type="chevron-down" />
							) : (
								<Icon style={{ fontSize: "0.7rem" }} type="chevron-left" />
							)}
						</span>
					)}
					{showBody && <div className="ml-6 mt-1">{body}</div>}
					<div>
						{authorNotCommitter ? (
							<>
								Authored by <b>{rev.commit.author.name}</b>, Committed by{" "}
								<b>{rev.commit.committer.name}</b>
							</>
						) : (
							<>
								Authored by <b>{rev.commit.author.name}</b>
							</>
						)}
					</div>
				</div>

				<span className="text-muted font-italic text-right">
					{FormatTime(Date.parse(rev.commit.author.date))}
				</span>
			</div>
		</div>
	);
}
