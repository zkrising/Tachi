import { ToAPIURL } from "util/api";
import Card from "components/layout/page/Card";
import ApiError from "components/util/ApiError";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import { TachiConfig } from "lib/config";
import React from "react";
import { Col, Row } from "react-bootstrap";
import { UGPT } from "types/react";
import { GPTUtility } from "types/ugpt";

function Component({ game, playtype, reqUser }: UGPT) {
	const { data, error } = useApiQuery<
		Array<{
			urlName: string;
			forSpecificUser?: boolean;
			playlistName: string;
			description: string;
		}>
	>(`/games/${game}/${playtype}/playlists`);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	return (
		<Row>
			<Col xs={12}>
				<Card
					header="Supported Playlists"
					footer={
						<div className="w-100 d-flex justify-content-center align-items-center">
							<div>
								Just drop this file into your <code>playlists/</code> folder.
							</div>
							<a
								className="btn btn-outline-primary ml-4"
								download={`tachi-playlists.json`}
								href={`data:text/plain,${encodeURIComponent(
									JSON.stringify(
										data.map((e) =>
											ToAPIURL(
												`${
													e.forSpecificUser
														? `/users/${reqUser.username}`
														: ""
												}/games/iidx/${playtype}/playlists/${e.urlName}`
											)
										)
									)
								)}`}
							>
								Download
							</a>
						</div>
					}
				>
					<ul>
						{data.map((e) => (
							<li key={e.urlName}>
								{e.playlistName} <br />
								{e.description}
							</li>
						))}
					</ul>
				</Card>
			</Col>
		</Row>
	);
}

export const IIDXPlaylistsTool: GPTUtility = {
	name: `${TachiConfig.name} IIDX Playlists`,
	urlPath: "playlists",
	description: `${TachiConfig.name} has its own IIDX playlists that you can use in-game via playlister!`,
	component: Component,
	personalUseOnly: true,
};
