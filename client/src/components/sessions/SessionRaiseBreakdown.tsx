import { APIFetchV1 } from "util/api";
import { ChangeOpacity } from "util/color-opacity";
import { CreateChartMap, CreateScoreIDMap, CreateSongMap } from "util/data";
import { PartialArrayRecordAssign } from "util/misc";
import DifficultyCell from "components/tables/cells/DifficultyCell";
import LampCell from "components/tables/cells/LampCell";
import ScoreCell from "components/tables/cells/ScoreCell";
import TitleCell from "components/tables/cells/TitleCell";
import MiniTable from "components/tables/components/MiniTable";
import { CommentModal, ModifyScore } from "components/tables/dropdowns/components/ScoreEditButtons";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import SelectButton from "components/util/SelectButton";
import { UserContext } from "context/UserContext";
import deepmerge from "deepmerge";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import {
	ChartDocument,
	Game,
	GamePTConfig,
	GetGamePTConfig,
	Grades,
	IDStrings,
	integer,
	Lamps,
	ScoreDocument,
	SessionScoreInfo,
	SongDocument,
	TableDocument,
} from "tachi-common";
import { SessionReturns } from "types/api-returns";

type SetScores = (scores: ScoreDocument[]) => void;

export default function SessionRaiseBreakdown({
	sessionData,
	setScores,
	noHeader,
}: {
	sessionData: SessionReturns;
	setScores?: SetScores;
	noHeader?: boolean;
}) {
	const game = sessionData.session.game;
	const playtype = sessionData.session.playtype;

	const { user } = useContext(UserContext);

	const { data, error } = useQuery(`/games/${game}/${playtype}/tables`, async () => {
		const res = await APIFetchV1<TableDocument[]>(`/games/${game}/${playtype}/tables`);

		if (!res.success) {
			throw new Error(res.description);
		}

		return res.body;
	});
	const [view, setView] = useState<"lamps" | "both" | "grades">("both");

	if (error) {
		return <>{(error as Error).message}</>;
	}

	if (!data) {
		return <Loading />;
	}

	return (
		<>
			{!noHeader && (
				<div className="col-12">
					<div className="row">
						<div className="col-12 col-lg-6 offset-lg-3">
							<div className="d-none d-lg-flex justify-content-center">
								<div className="btn-group">
									<SelectButton value={view} setValue={setView} id="lamps">
										<Icon type="lightbulb" />
										Lamps Only
									</SelectButton>

									<SelectButton value={view} setValue={setView} id="both">
										<Icon type="bolt" />
										Both
									</SelectButton>

									<SelectButton value={view} setValue={setView} id="grades">
										<Icon type="sort-alpha-up" />
										Grades Only
									</SelectButton>
								</div>
							</div>
						</div>
					</div>

					<Divider className="mt-4 mb-4" />

					{user?.id === sessionData.user.id && (
						<div className="d-lg-block d-none mb-4">
							Tip: You can click on scores to highlight/add comments!
						</div>
					)}
				</div>
			)}
			<SessionScoreStatBreakdown {...{ sessionData, view, setScores }} />
		</>
	);
}

function SessionScoreStatBreakdown({
	sessionData,
	view,
	setScores,
}: {
	sessionData: SessionReturns;
	setScores?: SetScores;
	view: "lamps" | "both" | "grades";
}) {
	const songMap = CreateSongMap(sessionData.songs);
	const chartMap = CreateChartMap(sessionData.charts);
	const scoreMap = CreateScoreIDMap(sessionData.scores);

	const [newLamps, newGrades] = useMemo(() => {
		const newLamps: Partial<
			Record<Lamps[IDStrings], { score: ScoreDocument; scoreInfo: SessionScoreInfo }[]>
		> = {};
		const newGrades: Partial<
			Record<Grades[IDStrings], { score: ScoreDocument; scoreInfo: SessionScoreInfo }[]>
		> = {};

		for (const scoreInfo of sessionData.session.scoreInfo) {
			const score = scoreMap.get(scoreInfo.scoreID);

			if (!score) {
				console.error(
					`Session score info contains scoreID ${scoreInfo.scoreID}, but no score exists?`
				);
				continue;
			}

			if (scoreInfo.isNewScore) {
				PartialArrayRecordAssign(newLamps, score.scoreData.lamp, { score, scoreInfo });
				PartialArrayRecordAssign(newGrades, score.scoreData.grade, { score, scoreInfo });
			} else {
				if (scoreInfo.lampDelta > 0) {
					PartialArrayRecordAssign(newLamps, score.scoreData.lamp, { score, scoreInfo });
				}

				if (scoreInfo.gradeDelta > 0) {
					PartialArrayRecordAssign(newGrades, score.scoreData.grade, {
						score,
						scoreInfo,
					});
				}
			}
		}

		return [newLamps, newGrades];
	}, [view]);

	const gptConfig = GetGamePTConfig(sessionData.session.game, sessionData.session.playtype);

	return (
		<>
			{view === "both" ? (
				<>
					<div className="col-12 col-lg-6">
						<MiniTable
							headers={["Lamp", "New Lamps"]}
							colSpan={[1, 2]}
							className="table-sm"
						>
							<ElementStatTable
								scores={sessionData.scores}
								setScores={setScores}
								chartMap={chartMap}
								songMap={songMap}
								counts={newLamps}
								game={sessionData.session.game}
								type="lamp"
								gptConfig={gptConfig}
							/>
						</MiniTable>
					</div>
					<div className="col-12 col-lg-6">
						<MiniTable
							headers={["Grade", "New Grades"]}
							colSpan={[1, 2]}
							className="table-sm"
						>
							<ElementStatTable
								scores={sessionData.scores}
								setScores={setScores}
								chartMap={chartMap}
								songMap={songMap}
								counts={newGrades}
								game={sessionData.session.game}
								type="grade"
								gptConfig={gptConfig}
							/>
						</MiniTable>
					</div>
				</>
			) : view === "grades" ? (
				<div className="col-12">
					<MiniTable headers={["Grade", "New Grades"]} colSpan={[1, 100]}>
						<ElementStatTable
							scores={sessionData.scores}
							setScores={setScores}
							fullSize
							chartMap={chartMap}
							songMap={songMap}
							counts={newGrades}
							game={sessionData.session.game}
							type="grade"
							gptConfig={gptConfig}
						/>
					</MiniTable>
				</div>
			) : (
				<div className="col-12">
					<MiniTable headers={["Lamps", "New Lamps"]} colSpan={[1, 100]}>
						<ElementStatTable
							scores={sessionData.scores}
							setScores={setScores}
							fullSize
							chartMap={chartMap}
							songMap={songMap}
							counts={newLamps}
							game={sessionData.session.game}
							type="lamp"
							gptConfig={gptConfig}
						/>
					</MiniTable>
				</div>
			)}
		</>
	);
}

function ElementStatTable({
	type,
	counts,
	gptConfig,
	songMap,
	chartMap,
	game,
	fullSize = false,
	scores,
	setScores,
}: {
	type: "lamp" | "grade";
	setScores?: SetScores;
	scores: ScoreDocument[];
	counts: Record<string, { score: ScoreDocument; scoreInfo: SessionScoreInfo }[]>;
	gptConfig: GamePTConfig;
	songMap: Map<integer, SongDocument<Game>>;
	chartMap: Map<string, ChartDocument<IDStrings>>;
	game: Game;
	fullSize?: boolean;
}) {
	const tableContents = useMemo(() => {
		// relements.. haha
		const relevantElements =
			type === "lamp"
				? gptConfig.lamps.slice(gptConfig.lamps.indexOf(gptConfig.clearLamp) - 1).reverse()
				: gptConfig.grades
						.slice(gptConfig.grades.indexOf(gptConfig.clearGrade) - 1)
						.reverse();

		const colours = type === "lamp" ? gptConfig.lampColours : gptConfig.gradeColours;

		const tableContents = [];
		for (const element of relevantElements) {
			if (!counts[element] || !counts[element].length) {
				continue;
			}

			const firstData = counts[element][0];

			tableContents.push(
				<tr key={element} className="breakdown-hover-row">
					<td
						style={{
							// @ts-expect-error this is a hack due to the funky type of colours and element.
							backgroundColor: ChangeOpacity(colours[element], 0.1),
						}}
						rowSpan={counts[element]!.length}
					>
						{element}
					</td>
					<BreakdownChartContents
						{...firstData}
						{...{
							chartMap,
							songMap,
							fullSize,
							game,
							gptConfig,
							type,
							scores,
							setScores,
						}}
					/>
				</tr>
			);

			for (const data of counts[element]!.slice(1)) {
				tableContents.push(
					<tr key={data.score.scoreID} className="breakdown-hover-row">
						<BreakdownChartContents
							{...data}
							{...{
								chartMap,
								songMap,
								fullSize,
								game,
								gptConfig,
								type,
								scores,
								setScores,
							}}
						/>
					</tr>
				);
			}
		}

		return tableContents;
	}, [type, counts, fullSize, game, scores]);

	if (tableContents.length === 0) {
		return (
			<tr>
				<td colSpan={3}>No Raises...</td>
			</tr>
		);
	}

	return <>{tableContents}</>;
}

function BreakdownChartContents({
	score,
	scoreInfo,
	game,
	songMap,
	chartMap,
	fullSize,
	gptConfig,
	type,
	scores,
	setScores,
}: {
	score: ScoreDocument;
	scoreInfo: SessionScoreInfo;
	fullSize: boolean;
	game: Game;
	songMap: Map<integer, SongDocument>;
	chartMap: Map<string, ChartDocument>;
	gptConfig: GamePTConfig;
	type: "lamp" | "grade";
	scores: Array<ScoreDocument>;
	setScores?: SetScores;
}) {
	const modifyScore = useMemo(
		() =>
			(
				{ highlight, comment }: { highlight?: boolean; comment?: string | null },
				scores: ScoreDocument[],
				setScores: SetScores
			) => {
				console.log(scores.filter((e) => e.highlight).length);

				const scoreID = score.scoreID;

				ModifyScore(scoreID, { highlight, comment }).then((r) => {
					if (r) {
						const filtered = scores.filter((e) => e.scoreID !== scoreID);
						const newScore = { ...score };

						if (highlight !== undefined) {
							newScore.highlight = highlight;
						}
						if (comment !== undefined) {
							newScore.comment = comment;
						}

						setScores([...filtered, newScore]);
					}
				});
			},
		[score, scores, setScores]
	);

	const chart = chartMap.get(score.chartID)!;
	const song = songMap.get(score.songID)!;

	const { user } = useContext(UserContext);

	const [highlight, setHighlight] = useState(score.highlight);
	const [comment, setComment] = useState(score.comment);
	const [firstRun, setFirstRun] = useState(true);

	useEffect(() => {
		if (firstRun) {
			setFirstRun(false);
			return;
		}

		if (!setScores) {
			return;
		}

		modifyScore({ highlight, comment }, scores, setScores);
	}, [highlight, comment]);

	if (!chart || !song) {
		console.error(`No chart for ${score.chartID}/${score.songID}???`);
		return null;
	}

	if (fullSize) {
		let preScoreCell = <td>No Play</td>;

		if (!scoreInfo.isNewScore) {
			const oldGradeIndex = score.scoreData.gradeIndex - scoreInfo.gradeDelta;
			const oldLampIndex = score.scoreData.lampIndex - scoreInfo.lampDelta;

			const mockScore = deepmerge(score, {
				scoreData: {
					score: score.scoreData.score - scoreInfo.scoreDelta,
					percent: score.scoreData.percent - scoreInfo.percentDelta,
					grade: gptConfig.grades[oldGradeIndex],
					gradeIndex: oldGradeIndex,
					lamp: gptConfig.lamps[oldLampIndex],
					lampIndex: oldLampIndex,
				},
			}) as ScoreDocument;

			if (type === "grade") {
				preScoreCell = <ScoreCell score={mockScore} />;
			} else {
				preScoreCell = <LampCell score={mockScore} />;
			}
		}

		if (score) {
			return (
				<>
					<TitleCell chart={chart} game={game} song={song} />
					<DifficultyCell chart={chart} game={game} />
					{preScoreCell}
					<td>⟶</td>
					{type === "grade" ? (
						<ScoreCell {...{ score, game, playtype: score.playtype }} />
					) : (
						<LampCell score={score} />
					)}
				</>
			);
		}
	}

	return (
		<>
			<TitleCell noArtist chart={chart} game={game} song={song} comment={comment} />
			<CommentHighlightManager
				highlight={highlight}
				setHighlight={setHighlight}
				comment={comment}
				setComment={setComment}
				// is the user looking at this session
				// and scores are settable
				isEditable={score.userID === user?.id && !!setScores}
			/>
			<DifficultyCell alwaysShort chart={chart} game={game} />
		</>
	);
}

/**
 * It manages the comment and highlight stuff.
 *
 * I don't know what else to call this function.
 */
function CommentHighlightManager({
	highlight,
	setHighlight,
	comment,
	setComment,
	isEditable,
}: {
	highlight: boolean;
	setHighlight: (hl: boolean) => void;
	comment: string | null;
	setComment: (cm: string | null) => void;
	isEditable: boolean;
}) {
	const [showCommentModal, setShowCommentModal] = useState(false);

	return (
		<td style={{ verticalAlign: "center" }}>
			<CommentModal
				show={showCommentModal}
				setShow={setShowCommentModal}
				initialComment={comment}
				onUpdate={(comment) => {
					setComment(comment);
					setShowCommentModal(false);
				}}
			/>
			{isEditable && (
				<span className="breakdown-hover-highlight-button">
					<Icon
						onClick={() => setShowCommentModal(true)}
						type="comment"
						regular
						style={{ paddingTop: "0.1rem", paddingRight: "0.33rem" }}
					/>
				</span>
			)}

			{isEditable ? (
				// editable, highlighted
				highlight ? (
					<Icon
						onClick={() => setHighlight(false)}
						colour="warning"
						type="star"
						style={{ paddingTop: "0.1rem", paddingRight: "0.33rem" }}
					/>
				) : (
					// editable, not highlighted
					<span className="breakdown-hover-highlight-button">
						<Icon
							onClick={() => setHighlight(true)}
							type="star"
							regular
							style={{ paddingTop: "0.1rem" }}
						/>
					</span>
				)
			) : (
				// non-editable, highlighted
				highlight && (
					<Icon
						colour="warning"
						type="star"
						style={{ paddingTop: "0.1rem", paddingRight: "0.33rem" }}
					/>
				)
			)}
		</td>
	);
}
