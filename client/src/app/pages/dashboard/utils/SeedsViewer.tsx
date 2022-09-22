import { FormatTime } from "util/time";
import { APIFetchV1 } from "util/api";
import { LoadSeeds } from "util/seeds";
import { StrSOV } from "util/sorts";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import Select from "components/util/Select";
import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Col, Modal, Row } from "react-bootstrap";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import { SetState } from "types/react";
import { TachiConfig } from "lib/config";
import ExternalLink from "components/util/ExternalLink";
import Card from "components/layout/page/Card";
import { GitCommit, Revision } from "types/git";
import { AllDatabaseSeeds, DatabaseSeedNames } from "tachi-common";
import SelectButton from "components/util/SelectButton";
import FormInput from "components/util/FormInput";
import SeedsTable from "components/tables/seeds/SeedsTable";

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
							message="Optionally, pick another commit to compare against. This commit should be newer than the base commit."
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
					</Col>
					<SeedsLoaderViewer baseRev={baseRev} headRev={headRev} />
				</Row>
			)}
		</>
	);
}

function SeedsLoaderViewer({ baseRev, headRev }: { baseRev: Revision; headRev: Revision | null }) {
	const [baseData, setBaseData] = useState<Partial<AllDatabaseSeeds> | null>(null);
	const [headData, setHeadData] = useState<Partial<AllDatabaseSeeds> | null>(null);

	useEffect(() => {
		(async () => {
			// enter loading...
			setBaseData(null);
			const data = await LoadSeeds(baseRev.repo, baseRev.c.sha);

			setBaseData(data);
		})();
	}, [baseRev]);

	useEffect(() => {
		(async () => {
			// enter loading...
			setHeadData(null);

			if (headRev === null) {
				return;
			}

			const data = await LoadSeeds(headRev.repo, headRev.c.sha);

			setHeadData(data);
		})();
	}, [headRev]);

	if (baseData === null) {
		return (
			<Col xs={12}>
				<div className="d-flex justify-content-center">
					<div>
						<Loading />
						<br />
						Reading data...
					</div>
				</div>
			</Col>
		);
	}

	if (headData !== null) {
		return <>{Object.keys(headData)}</>;
	}

	return <SeedsAbsoluteState seedsData={baseData} />;
}

function SeedsAbsoluteState({ seedsData }: { seedsData: Partial<AllDatabaseSeeds> }) {
	const files = Object.keys(seedsData).sort(StrSOV((k) => k)) as Array<keyof AllDatabaseSeeds>;

	const [file, setFile] = useState(files[0]);

	return (
		<>
			<Col xs={12}>
				<Card header="Collections">
					<div className="d-flex flex-wrap" style={{ justifyContent: "space-around" }}>
						{files.map((e) => (
							<div key={e} className="my-2">
								<SelectButton id={e} setValue={setFile} value={file}>
									{e} ({seedsData[e]?.length ?? 0})
								</SelectButton>
							</div>
						))}
					</div>
				</Card>
			</Col>
			<Col xs={12}>
				<Divider />
				<h1 className="text-center">{file}</h1>
				<Divider />
				<SeedsTable data={seedsData} file={file} />
			</Col>
		</>
	);
}

type Branch = { name: string; sha: string };

function SeedsPicker({
	hasLocalAPI,
	header,
	rev,
	setRev,
	message,
}: {
	hasLocalAPI: boolean;
	header: string;
	rev: Revision | null;
	setRev: SetState<Revision | null>;
	message?: string;
}) {
	// a repo is one of the following:
	// null - nothing has been selected yet
	// "local" - we're referring to the files on the local development disk
	// "GitHub:NAME/REPO" - we're referring to a repository on github, like GitHub:TNG-Dev/Tachi
	const [repo, setRepo] = useState<string | null>(null);

	// to list commits, we need to know what branch we're looking at.
	// we also need to know the set of all available branches
	const [branch, setBranch] = useState<string | null>(null);
	const [branches, setBranches] = useState<string[] | null>(null);

	const [shaBranchLookup, setSHABranchLookup] = useState<Record<string, string[]>>({});

	// When repo changes, refetch the available branches.
	useEffect(() => {
		if (repo === null) {
			return setBranches(null);
		}

		(async () => {
			if (repo === "local") {
				const res = await APIFetchV1<{ branches: Branch[]; current: Branch | null }>(
					`/seeds/branches`
				);

				if (!res.success) {
					throw new Error(
						`Failed to fetch branches for your local repo. ${res.description}.`
					);
				}

				setBranches(res.body.branches.map((e) => e.name));

				// can't be bothered getting this to work
				// if (res.body.current) {
				// 	setBranch(res.body.current.name);
				// }

				// to get pretty UI stuff, we keep track of the HEADs of all branches
				// so we can render what branch a commit is the HEAD of in the UI.
				const lookup: Record<string, string[]> = {};

				for (const branch of res.body.branches) {
					if (branch.sha in lookup) {
						lookup[branch.sha].push(branch.name);
					} else {
						lookup[branch.sha] = [branch.name];
					}
				}

				setSHABranchLookup(lookup);
			} else if (repo.startsWith("GitHub:")) {
				throw new Error("TODO");
			}
		})();
	}, [repo]);

	// if branches change, re-prompt for users to select a branch
	useEffect(() => {
		setBranch(null);
	}, [branches]);

	const [show, setShow] = useState(false);

	const [subject, body] = useMemo(() => {
		if (rev === null) {
			return [null, null];
		}

		const [subject, _gap, ...maybeBodies] = rev.c.commit.message.split("\n");

		return [subject, maybeBodies?.join("\n") ?? null];
	}, [rev]);

	const [showBody, setShowBody] = useState(false);

	const authorNotCommitter = rev?.c.commit.author.email !== rev?.c.commit.committer.email;

	return (
		<>
			<Card header={header}>
				{rev ? (
					<div className="mr-3" style={{ textAlign: "left" }}>
						<span style={{ fontSize: "1.15rem" }}>
							<code>
								{rev.repo}/{rev.c.sha}
							</code>
							: {subject}
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
						<Divider />
						<div style={{ width: "100%", display: "flex" }}>
							<div style={{ flex: 1 }}>
								{authorNotCommitter ? (
									<>
										Authored by <b>{rev.c.commit.author.name}</b>, Committed by{" "}
										<b>{rev.c.commit.committer.name}</b>
									</>
								) : (
									<>
										Authored by <b>{rev.c.commit.author.name}</b>
									</>
								)}
							</div>
							<div className="text-right" style={{ flex: 1 }}>
								{FormatTime(Date.parse(rev.c.commit.author.date))}
							</div>
						</div>
						<Divider />
						<div className="text-center">
							<span
								className="text-muted underline-on-hover"
								onClick={() => setShow(true)}
							>
								Change Commit...
							</span>
						</div>
					</div>
				) : (
					<>
						{message && (
							<>
								<span>{message}</span>
								<Divider />
							</>
						)}

						<Button variant="secondary" onClick={() => setShow(true)}>
							Pick Commit...
						</Button>
					</>
				)}
			</Card>
			<Modal show={show} size="xl" onHide={() => setShow(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Pick {header}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Row>
						<Col xs={12} className="text-center">
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
							</div>
							{branches && (
								<div className="mt-2">
									<span style={{ fontSize: "large" }}>Branch:</span>
									<Select
										style={{ display: "inline", width: "unset" }}
										className="mx-2"
										value={branch}
										setValue={setBranch}
										allowNull
									>
										{branches.map((e) => (
											<option key={e} value={e}>
												{e}
											</option>
										))}
									</Select>
								</div>
							)}
						</Col>
						<Col xs={12} lg={10} className="offset-lg-1 text-center">
							{repo && branch && (
								<>
									<Divider />
									<RevSelector
										shaBranchLookup={shaBranchLookup}
										repo={repo}
										branch={branch}
										onSelect={(commit) => {
											setRev({ c: commit, repo });
											setShow(false);
										}}
									/>
								</>
							)}
						</Col>
					</Row>
				</Modal.Body>
			</Modal>
		</>
	);
}

function RevSelector({
	repo,
	onSelect,
	branch,
	shaBranchLookup,
}: {
	repo: string;
	onSelect: (g: GitCommit) => void;
	branch: string;
	shaBranchLookup: Record<string, string[]>;
}) {
	const [revs, setRevs] = useState<Array<GitCommit>>([]);
	const [filteredRevs, setFilteredRevs] = useState<Array<GitCommit>>([]);

	// We have the option of filtering returned revisions according to only those that
	// affect a specific file. Sounds useful.
	const [collection, setCollection] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			if (repo.startsWith("GitHub:")) {
				throw new Error("Unsupported...");
			} else {
				// startLoading
				setRevs([]);

				const params = new URLSearchParams();
				params.set("branch", branch);

				if (collection) {
					params.set("file", collection);
				}

				// local
				const res = await APIFetchV1<Array<GitCommit>>(
					`/seeds/commits?${params.toString()}`
				);

				if (!res.success) {
					throw new Error(`Failed to fetch commits? ${res.description}`);
				}

				const hasUncommittedRes = await APIFetchV1<boolean>(
					"/seeds/has-uncommitted-changes"
				);

				if (hasUncommittedRes.success && hasUncommittedRes.body) {
					const LOCAL_COMMIT: GitCommit = {
						sha: "WORKING_DIRECTORY",
						commit: {
							author: {
								name: "Not Committed Yet",
								date: "1970-01-01",
								email: "null@example.com",
							},
							committer: {
								name: "Not Committed Yet",
								date: "1970-01-01",
								email: "null@example.com",
							},
							message: "Uncommitted changes on your local disk.",
						},
					};

					setRevs([LOCAL_COMMIT, ...res.body]);
				} else {
					setRevs(res.body);
				}
			}
		})();
	}, [repo, branch, collection]);

	useEffect(() => {
		setFilteredRevs(revs);
		setSearch("");
	}, [revs]);

	const [search, setSearch] = useState("");

	useEffect(() => {
		if (search === "") {
			return setFilteredRevs(revs);
		}

		// remarkably lazy search implementation, but convenient.
		return setFilteredRevs(
			revs.filter(
				(r) =>
					r.sha.includes(search) ||
					r.commit.message.includes(search) ||
					r.commit.author.name.includes(search) ||
					r.commit.committer.name.includes(search)
			)
		);
	}, [search]);

	return (
		<>
			<div>
				<span>Show changes that affect: </span>
				<Select
					value={collection}
					setValue={setCollection}
					unselectedName="Any Collection"
					allowNull
					className="mx-2"
					style={{ width: "unset", display: "inline" }}
				>
					{DatabaseSeedNames.map((e) => (
						<option key={e} value={e}>
							{e}
						</option>
					))}
				</Select>
			</div>
			<Divider />
			<FormInput
				fieldName="Search"
				placeholder="Search commits..."
				value={search}
				setValue={setSearch}
			/>
			<Divider />
			<div className="timeline timeline-2">
				<div className="timeline-bar"></div>
				{filteredRevs.map((r) => (
					<Revision
						tags={shaBranchLookup[r.sha] ?? []}
						key={r.sha}
						rev={r}
						onSelect={onSelect}
					/>
				))}
			</div>
		</>
	);
}

function Revision({
	rev,
	tags = [],
	onSelect: onSelect,
}: {
	rev: GitCommit;
	tags?: string[];
	onSelect: (g: GitCommit) => void;
}) {
	const authorNotCommitter = rev.commit.author.email !== rev.commit.committer.email;

	// if there's a body then there's two newlines.
	const [subject, _gap, ...maybeBodies] = rev.commit.message.split("\n");

	const [showBody, setShowBody] = useState(false);

	const body: string | undefined = maybeBodies?.join("\n");

	return (
		<div className="timeline-item">
			<span className="timeline-badge bg-primary"></span>
			<div className="timeline-content d-flex align-items-center justify-content-between">
				<div className="mr-3" style={{ width: "70%", textAlign: "left" }}>
					<span style={{ fontSize: "1.15rem" }}>
						<code>{rev.sha}</code>:{" "}
						<a className="gentle-link" onClick={() => onSelect(rev)}>
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
					{tags.length !== 0 && (
						<span className="ml-2">
							{tags.map((e) => (
								<Badge className="ml-2" variant="primary" key={e}>
									{e}
								</Badge>
							))}
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
