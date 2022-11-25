import { APIFetchV1 } from "util/api";
import { FormatTime } from "util/time";
import { HumanisedJoinArray } from "util/misc";
import Card from "components/layout/page/Card";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import Muted from "components/util/Muted";
import { UserContext } from "context/UserContext";
import React, { useContext, useState } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
	FormatGame,
	GoalDocument,
	GoalSubscriptionDocument,
	QuestDocument,
	QuestSection,
} from "tachi-common";
import { GamePT } from "types/react";
import { TargetsContext } from "context/TargetsContext";
import QuickTooltip from "components/layout/misc/QuickTooltip";

export default function Quest({
	quest,
	goals,
}: {
	quest: QuestDocument;
	goals: Map<string, GoalDocument>;
}) {
	const { user } = useContext(UserContext);
	const { questSubs, reloadTargets } = useContext(TargetsContext);
	const [subscribing, setSubscribing] = useState(false);

	return (
		<Card
			header={
				<div>
					<h3>{quest.name}</h3>

					<div>{quest.desc}</div>
					<div className="mt-4">
						<Muted>Game: {FormatGame(quest.game, quest.playtype)}</Muted>
					</div>
				</div>
			}
		>
			{quest.questData.map((e, i) => (
				<React.Fragment key={i}>
					<QuestSectionComponent
						game={quest.game}
						playtype={quest.playtype}
						section={e}
						goals={goals}
					/>
					<Divider />
				</React.Fragment>
			))}
			<div className="w-100 d-flex mt-8 align-items-center">
				<div>
					<Link
						className="mr-auto"
						to={`/dashboard/games/${quest.game}/${quest.playtype}/quests/${quest.questID}`}
					>
						View More Info
					</Link>
				</div>
				{user &&
					(questSubs.has(quest.questID) ? (
						<Button
							variant="outline-danger"
							className="ml-auto"
							onClick={async () => {
								setSubscribing(true);

								await APIFetchV1(
									`/users/${user.id}/games/${quest.game}/${quest.playtype}/targets/quests/${quest.questID}`,
									{
										method: "DELETE",
									},
									true,
									true
								);
								await reloadTargets();

								setSubscribing(false);
							}}
							disabled={subscribing}
						>
							{subscribing ? (
								"Unsubscribing..."
							) : (
								<>
									<Icon type="trash" />
									Unsubscribe
								</>
							)}
						</Button>
					) : (
						<Button
							variant="outline-success"
							className="ml-auto"
							onClick={async () => {
								setSubscribing(true);

								await APIFetchV1(
									`/users/${user.id}/games/${quest.game}/${quest.playtype}/targets/quests/${quest.questID}`,
									{
										method: "PUT",
									},
									true,
									true
								);
								await reloadTargets();

								setSubscribing(false);
							}}
							disabled={subscribing}
						>
							{subscribing ? (
								"Subscribing..."
							) : (
								<>
									<Icon type="scroll" />
									Subscribe to Quest
								</>
							)}
						</Button>
					))}
			</div>
		</Card>
	);
}

function QuestSectionComponent({
	section,
	game,
	playtype,
	goals,
}: {
	section: QuestSection;
	goals: Map<string, GoalDocument>;
} & GamePT) {
	return (
		<div>
			<h5>{section.title}</h5>
			{section.desc && <div>{section.desc}</div>}
			<br />
			{section.goals.length === 0 ? (
				<Muted>No Goals...</Muted>
			) : (
				<div className="pl-6">
					{section.goals.map((e, i) => {
						const goal = goals.get(e.goalID);

						if (!goal) {
							return <div>Unknown goal '{e.goalID}'. This should never happen.</div>;
						}

						return (
							<div className="pb-2" key={i}>
								<InnerQuestSectionGoal goal={goal} note={e.note} />
							</div>
						);
					})}
				</div>
			)}
			<br />
		</div>
	);
}

export function InnerQuestSectionGoal({
	goal,
	note,
	dependencies,
}: {
	goal: GoalDocument;
	note?: string;
	dependencies?: string[];
}) {
	const { goalSubs } = useContext(TargetsContext);

	const { game, playtype } = goal;
	const goalSub = goalSubs.get(goal.goalID);

	if (!goalSub) {
		return (
			<>
				<div className="w-100 d-flex">
					<div>
						<Icon
							style={{ verticalAlign: "middle", fontSize: "0.4rem" }}
							type="circle"
						/>
					</div>

					<Link
						className="gentle-link ml-2"
						to={`/dashboard/games/${game}/${playtype}/goals/${goal.goalID}`}
					>
						{goal.name}
					</Link>
				</div>
				{note && <Muted>{note}</Muted>}
			</>
		);
	}

	return (
		<>
			<div className="w-100 d-flex">
				<QuickTooltip
					tooltipContent={
						goalSub.achieved
							? `Achieved on ${FormatTime(goalSub.timeAchieved)}`
							: goalSub.lastInteraction
							? `Last raised on ${FormatTime(goalSub.lastInteraction)}`
							: `Never Attempted.`
					}
				>
					<div>
						{goalSub.achieved ? (
							<Icon
								style={{ verticalAlign: "middle" }}
								regular
								type="check-square"
								colour="success"
							/>
						) : (
							<Icon
								style={{ verticalAlign: "middle" }}
								regular
								type="square"
								colour="danger"
							/>
						)}
					</div>
				</QuickTooltip>

				<Link
					className="gentle-link ml-2"
					to={`/dashboard/games/${game}/${playtype}/goals/${goal.goalID}`}
				>
					{goal.name}
				</Link>

				{!goalSub.achieved && (
					<div className="ml-auto text-danger">
						<span className="text-danger">{goalSub.progressHuman}</span>
						<Muted> / {goalSub.outOfHuman}</Muted>
					</div>
				)}
			</div>
			<div>
				{note && <Muted>{note}</Muted>}
				{dependencies && (
					<FormatGoalDependencies
						isStandalone={goalSub.wasAssignedStandalone}
						deps={dependencies}
					/>
				)}
			</div>
		</>
	);
}

function FormatGoalDependencies({ deps, isStandalone }: { deps: string[]; isStandalone: boolean }) {
	let str;
	if (isStandalone && deps.length === 0) {
		str = `Assigned standalone.`;
	} else if (isStandalone && deps.length > 0) {
		str = `Assigned standalone and from ${HumanisedJoinArray(deps, "and")}`;
	} else if (deps.length === 0) {
		return null;
	} else {
		str = `From ${HumanisedJoinArray(deps, "and")}`;
	}

	return <Muted>{str}</Muted>;
}
