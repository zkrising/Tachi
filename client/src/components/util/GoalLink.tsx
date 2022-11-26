import React from "react";
import { Link } from "react-router-dom";
import { GoalDocument } from "tachi-common";
import useLUGPTSettings from "./useLUGPTSettings";

export default function GoalLink({ goal }: { goal: GoalDocument }) {
	const { settings } = useLUGPTSettings();

	switch (goal.charts.type) {
		case "multi":
			return <span className="ml-2">{goal.name}</span>;
		case "single":
			return (
				<Link
					className="gentle-link ml-2"
					to={`/dashboard/games/${goal.game}/${goal.playtype}/charts/${goal.charts.data}`}
				>
					{goal.name}
				</Link>
			);

		case "folder":
			if (!settings) {
				return <span className="ml-2">{goal.name}</span>;
			}
			return (
				<Link
					className="gentle-link ml-2"
					to={`/dashboard/users/${settings.userID}/games/${goal.game}/${goal.playtype}/folders/${goal.charts.data}`}
				>
					{goal.name}
				</Link>
			);
	}
}
