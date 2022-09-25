import { APIFetchV1 } from "util/api";
import useSetSubheader from "components/layout/header/useSetSubheader";
import SeedsPicker from "components/seeds/SeedsPicker";
import SeedsStateViewer from "components/seeds/SeedsStateViewer";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import SelectButton from "components/util/SelectButton";
import { TachiConfig } from "lib/config";
import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { GitCommit, Revision } from "types/git";

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
	// base, rev a-la traditional git comparisons. Head is expected to be 'after'
	// the base, but no order is enforced.
	const [baseRev, setBaseRev] = useState<Revision | null>(null);
	const [headRev, setHeadRev] = useState<Revision | null>(null);
	const [urlLoading, setURLLoading] = useState(false);
	const [isFirstLoad, setIsFirstLoad] = useState(true);

	const params = useParams<{ repo: string | undefined; sha: string | undefined }>();

	console.log(params);

	const { repo, sha } = params;

	const [view, setView] = useState<"DIFF" | "FULL">("DIFF");

	useEffect(() => {
		if (!isFirstLoad) {
			return;
		}

		// if we've been given stuff in the URL and don't already have a baseRev
		if (sha && repo && !baseRev) {
			setURLLoading(true);

			(async () => {
				if (repo === "local") {
					const params = new URLSearchParams({ sha });

					const res = await APIFetchV1<GitCommit>(`/seeds/commit?${params.toString()}`);

					if (!res.success) {
						throw new Error(
							`Failed to fetch info about commit ${sha}: ${res.description}.`
						);
					}

					setBaseRev({
						c: res.body,
						repo,
					});

					setURLLoading(false);

					setIsFirstLoad(false);
				} else if (repo.startsWith("GitHub:")) {
					const repoName = repo.slice("GitHub:".length);

					const res: GitCommit = await fetch(
						`https://github.com/${repoName}/seeds/commit/${sha}}`
					).then((r) => r.json());

					setBaseRev({
						c: res,
						repo,
					});

					setURLLoading(false);

					setIsFirstLoad(false);
				}
			})();
		}
	}, [isFirstLoad]);

	useEffect(() => {
		if (baseRev) {
			const params = new URLSearchParams({
				repo: baseRev.repo,
				sha: baseRev.c.sha,
			});

			window.history.replaceState(null, "", `?${params.toString()}`);
		} else {
			window.history.replaceState(null, "", "");
		}
	}, [baseRev]);

	// if sha XOR repo, this should not be allowed.
	if (!!sha !== !!repo) {
		return <div>Invalid reference, both a repo and a sha must be provided in the URL.</div>;
	}

	if (urlLoading) {
		return (
			<div className="w-100 d-flex justify-content-center">
				<Loading />
				<br />
				<span>Fetching information from the provided URL...</span>
			</div>
		);
	}

	return (
		<>
			<Row>
				<Col xs={12} lg={baseRev ? 6 : 12} className="text-center">
					<SeedsPicker
						hasLocalAPI={hasLocalAPI}
						header="Base Commit"
						setRev={setBaseRev}
						rev={baseRev}
					/>
				</Col>
				{baseRev && (
					<Col xs={12} lg={6} className="text-center">
						<SeedsPicker
							hasLocalAPI={hasLocalAPI}
							header="Compare Commit"
							message="Optionally, pick another arbitary commit to show all the changes between.
This commit should be newer than the base commit!"
							setRev={setHeadRev}
							rev={headRev}
						/>
					</Col>
				)}
			</Row>
			{baseRev && (
				<Row>
					<Col xs={12}>
						<Divider />
						{!headRev && (
							<div className="w-100 d-flex justify-content-center">
								<SelectButton
									className="mx-2"
									value={view}
									setValue={setView}
									id="DIFF"
								>
									View Changes
								</SelectButton>
								<SelectButton value={view} setValue={setView} id="FULL">
									View Full State
								</SelectButton>
							</div>
						)}

						<Divider />
					</Col>
					<SeedsStateViewer baseRev={baseRev} headRev={headRev} view={view} />
				</Row>
			)}
		</>
	);
}
