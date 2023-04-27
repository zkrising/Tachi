import Activity from "components/activity/Activity";
import { AllLUGPTStatsContext } from "context/AllLUGPTStatsContext";
import React, { useContext } from "react";
import { UserDocument } from "tachi-common";
import { DashboardLoggedInNoScores } from "./DashboardLoggedInNoScores";

export default function DashboardActivity({ user }: { user: UserDocument }) {
	const { ugs } = useContext(AllLUGPTStatsContext);

	if (ugs?.length === 0) {
		return <DashboardLoggedInNoScores user={user} />;
	}

	return (
		<>
			<div className="display-4 mx-2 mb-4">Here's what's been happening.</div>
			<Activity url={`/users/${user.id}/activity?includeRivals=true&includeFollowers=true`} />
		</>
	);
}
