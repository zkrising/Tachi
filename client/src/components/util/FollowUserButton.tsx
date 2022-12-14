import { APIFetchV1 } from "util/api";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { UserDocument } from "tachi-common";
import QuickTooltip from "components/layout/misc/QuickTooltip";

export default function FollowUserButton({ userToFollow }: { userToFollow: UserDocument }) {
	const { settings: userSettings, setSettings: setUserSettings } =
		useContext(UserSettingsContext);

	if (!userSettings) {
		return null;
	}

	// can't follow yourself
	if (userSettings.userID === userToFollow.id) {
		return null;
	}

	if (userSettings.following.includes(userToFollow.id)) {
		return (
			<Button
				variant="outline-danger"
				onClick={async () => {
					const res = await APIFetchV1(
						`/users/${userSettings.userID}/following/remove`,
						{
							method: "POST",
							body: JSON.stringify({
								userID: userToFollow.id,
							}),
							headers: {
								"Content-Type": "application/json",
							},
						},
						true,
						true
					);

					if (res.success) {
						const newFollowing = userSettings.following.filter(
							(e) => e !== userToFollow.id
						);

						setUserSettings({
							...userSettings,
							following: newFollowing,
						});
					}
				}}
			>
				Unfollow
			</Button>
		);
	}

	return (
		<QuickTooltip tooltipContent="Following a user will mean you'll see their sessions and updates in your feed.">
			<Button
				variant="outline-success"
				onClick={async () => {
					const res = await APIFetchV1(
						`/users/${userSettings.userID}/following/add`,
						{
							method: "POST",
							body: JSON.stringify({
								userID: userToFollow.id,
							}),
							headers: {
								"Content-Type": "application/json",
							},
						},
						true,
						true
					);

					if (res.success) {
						const newFollowing = [...userSettings.following, userToFollow.id];

						setUserSettings({
							...userSettings,
							following: newFollowing,
						});
					}
				}}
			>
				Follow
			</Button>
		</QuickTooltip>
	);
}
