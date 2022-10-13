import { ToAPIURL } from "util/api";
import React from "react";
import { Link } from "react-router-dom";
import { PublicUserDocument } from "tachi-common";
import { GamePT } from "types/react";

export default function UserCell({ user, game, playtype }: { user: PublicUserDocument } & GamePT) {
	return (
		<td
			style={{
				backgroundImage: user.customPfpLocation
					? `linear-gradient(to right, rgba(19, 19, 19, 0.8), rgba(19, 19, 19, 1)), url(${ToAPIURL(
							`/users/${user.id}/pfp`
					  )})`
					: undefined,
				backgroundRepeat: "no-repeat",
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			<Link
				style={{
					maskImage: "unset",
				}}
				className="gentle-link"
				to={`/dashboard/users/${user.username}/games/${game}/${playtype}`}
			>
				{user.username}
			</Link>
		</td>
	);
}
