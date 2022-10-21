import { ToAPIURL } from "util/api";
import React from "react";
import { Link } from "react-router-dom";
import { PublicUserDocument } from "tachi-common";
import { GamePT } from "types/react";

export default function UserCell({ user, game, playtype }: { user: PublicUserDocument } & GamePT) {
	return (
		<td
			style={{
				backgroundRepeat: "no-repeat",
				backgroundSize: "cover",
				backgroundPosition: "center",
				["--image-url" as string]: `url(${ToAPIURL(`/users/${user.id}/pfp`)})`,
			}}
			className="fading-image-td-right"
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
