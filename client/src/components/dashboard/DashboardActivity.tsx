import Activity from "components/activity/Activity";
import React from "react";
import { UserDocument } from "tachi-common";

export default function DashboardActivity({ user }: { user: UserDocument }) {
	return (
		<>
			<div className="display-4 mb-4">Here's what you and your rivals have been up to!</div>
			<Activity url={`/users/${user.id}/activity?includeRivals=true`} />
		</>
	);
}
