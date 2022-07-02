import ProfilePicture from "components/user/ProfilePicture";
import React from "react";
import { Link } from "react-router-dom";
import { PublicUserDocument } from "tachi-common/js/types";
import { JustChildren, GamePT } from "types/react";

export default function UserIcon({
	user,
	children,
	game,
	playtype,
}: { user: PublicUserDocument } & JustChildren & Partial<GamePT>) {
	return (
		<div className="text-center p-8">
			<ProfilePicture user={user} />
			<h1 className="mt-2">
				<Link
					className="gentle-link"
					to={
						game && playtype
							? `/dashboard/users/${user.username}/games/${game}/${playtype}`
							: `/dashboard/users/${user.username}`
					}
				>
					{user.username}
				</Link>
			</h1>
			<div className="d-flex justify-content-center">{children}</div>
		</div>
	);
}
