import { APIFetchV1 } from "util/api";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext } from "react";
import { UserDocument } from "tachi-common";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import Button from "react-bootstrap/Button";
import { Placement } from "react-bootstrap/esm/types";

export default function FollowUserButton({
	userToFollow,
	className = "",
	tooltipPlacement = "auto",
}: {
	userToFollow: UserDocument;
	className?: string;
	tooltipPlacement?: Placement;
}) {
	const { settings: userSettings, setSettings: setUserSettings } =
		useContext(UserSettingsContext);

	if (!userSettings) {
		return null;
	}

	// can't follow yourself
	if (userSettings.userID === userToFollow.id) {
		return null;
	}

	const unfollow = userSettings.following.includes(userToFollow.id);
	let handleFollow: () => void;

	if (unfollow) {
		handleFollow = async function () {
			// Unfollow User
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
				const newFollowing = userSettings.following.filter((e) => e !== userToFollow.id);

				setUserSettings({
					...userSettings,
					following: newFollowing,
				});
			}
		};
	} else {
		handleFollow = async function () {
			// Follow user
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
		};
	}

	const buttonStyle = unfollow ? "bg-hover-danger" : "bg-hover-success";
	const buttonText = unfollow ? "Unfollow" : "Follow";

	return (
		<QuickTooltip
			placement={tooltipPlacement}
			tooltipContent="Following a user will mean you'll see their sessions and updates in your feed."
			className="d-none d-md-block"
			show={unfollow ? false : undefined}
		>
			<Button
				size="sm"
				variant="secondary"
				className={`${buttonStyle} ${className} fw-light user-select-none border-0`}
				onClick={handleFollow}
			>
				{buttonText}
			</Button>
		</QuickTooltip>
	);
}
