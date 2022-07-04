import useSetSubheader from "components/layout/header/useSetSubheader";
import React from "react";
import { Link } from "react-router-dom";
import { Game, GetGameConfig } from "tachi-common";

export default function PlaytypeSelect({
	game,
	base,
	subheaderCrumbs,
	subheaderTitle,
}: {
	game: Game;
	base: string;
	subheaderCrumbs: string[] | string;
	subheaderTitle: string;
}) {
	const gameConfig = GetGameConfig(game);

	useSetSubheader(subheaderCrumbs, [game], subheaderTitle);

	return (
		<div className="col-12 col-lg-6 mx-auto">
			<div className="card card-custom">
				<div className="card-header">
					<h3>Playtype Selector</h3>
				</div>
				<div className="card-body">
					This game has multiple playtypes. Please select one to view!
				</div>
				<div className="card-footer">
					<div className="d-flex justify-content-center btn-group">
						{gameConfig.validPlaytypes.map(pt => (
							<Link
								key={pt}
								className="btn btn-outline-primary float-right"
								to={`${base}/${pt}`}
							>
								{pt}
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
