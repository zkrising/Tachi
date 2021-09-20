import React from "react";
import { Link } from "react-router-dom";
import { PublicUserDocument } from "tachi-common";
import { GamePT } from "types/react";

export default function UserCell({ user, game, playtype }: { user: PublicUserDocument } & GamePT) {
	return (
		<td>
			<Link
				className="gentle-link"
				to={`/dashboard/users/${user.username}/games/${game}/${playtype}`}
			>
				{user.username}
			</Link>
		</td>
	);
}
