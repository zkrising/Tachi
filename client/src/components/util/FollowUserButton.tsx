import { APIFetchV1 } from "util/api";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext } from "react";
import { UserDocument } from "tachi-common";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import Icon from "./Icon";

export default function FollowUserButton({
	userToFollow,
	className = "",
	tooltipPlacement = "auto",
	tooltipClassName = "",
	breakpoint,
}: {
	userToFollow: UserDocument;
	className?: string;
	tooltipPlacement?:
		| "auto"
		| "auto-start"
		| "auto-end"
		| "top-start"
		| "top"
		| "top-end"
		| "right-start"
		| "right"
		| "right-end"
		| "bottom-end"
		| "bottom"
		| "bottom-start"
		| "left-end"
		| "left"
		| "left-start"
		| undefined;
	tooltipClassName?: string;
	breakpoint?: boolean;
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

	if (userSettings.following.includes(userToFollow.id)) {
		return (
			<QuickTooltip
				placement={tooltipPlacement}
				tooltipContent={<>Unfollow {userToFollow.username}</>}
				className={tooltipClassName}
			>
				<span
					className="cursor-pointer user-select-none text-hover-danger"
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
					<Icon type="user-minus" className={className} />
				</span>
			</QuickTooltip>
		);
	}

	return (
		<QuickTooltip
			placement={tooltipPlacement}
			tooltipContent="Following a user will mean you'll see their sessions and updates in your feed."
			show={breakpoint ? undefined : false}
		>
			<span
				className="cursor-pointer text-hover-success user-select-none"
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
				<Icon type="user-plus" className={className} />
			</span>
		</QuickTooltip>
	);
}
