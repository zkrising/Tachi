import useSetSubheader from "components/layout/header/useSetSubheader";
import React from "react";
import { Link } from "react-router-dom";
import { Game, GetGameConfig } from "tachi-common";

export default function PlaytypeSelect({ game }: { game: Game }) {
	const gameConfig = GetGameConfig(game);

	useSetSubheader(["Games", gameConfig.name], [game], `${gameConfig.name} Playtype Selection`);

	return (
		<div className="col-12 col-lg-6 justify-content-center">
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
								to={`/dashboard/games/${game}/${pt}`}
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
