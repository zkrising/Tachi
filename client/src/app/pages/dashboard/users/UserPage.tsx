import Loading from "components/util/Loading";
import { BackgroundContext } from "context/BackgroundContext";
import React, { useContext, useEffect } from "react";
import { PublicUserDocument } from "tachi-common";
import { ToAPIURL } from "util/api";
import { UpdateSubheader } from "util/subheader";
import { SubheaderContext } from "context/SubheaderContext";
import Divider from "components/util/Divider";

export default function UserPage({ reqUser }: { reqUser: PublicUserDocument }) {
	const { setBreadcrumbs, setTitle } = useContext(SubheaderContext);
	const { setBackground } = useContext(BackgroundContext);

	useEffect(() => {
		UpdateSubheader(["Users", `${reqUser.username}'s Profile`], setTitle, setBreadcrumbs);

		setBackground(ToAPIURL(`/users/${reqUser.id}/banner`));

		return () => {
			setBackground(null);
		};
	}, [reqUser]);

	if (!reqUser) {
		return <Loading />;
	}

	// this all sucks
	return (
		<div className="card mb-5 mb-xxl-8 w-100">
			<div className="card-body pt-9 pb-0">
				<div className="d-flex flex-wrap flex-sm-nowrap mx-4 align-items-center">
					<div className="mr-6">
						<img
							src={ToAPIURL(`/users/${reqUser.id}/pfp`)}
							alt={`${reqUser.username}'s Profile Picture`}
							className="rounded"
							style={{
								width: "128px",
								height: "128px",
								boxShadow: "0px 0px 10px 0px #000000",
							}}
						/>
					</div>

					<div className="align-self-start">
						<div className="font-weight-bolder font-size-h1">
							<div>{reqUser.username}</div>
						</div>
					</div>

					<div className="ml-auto align-self-center">
						<ul>
							{reqUser.socialMedia.discord ? (
								<li>
									<i className="flaticon2 flaticon-twitter-logo"></i>{" "}
									{reqUser.socialMedia.discord}
								</li>
							) : null}
							{reqUser.socialMedia.discord ? (
								<li>
									<i className="flaticon2 flaticon-twitter-logo"></i>{" "}
									{reqUser.socialMedia.discord}
								</li>
							) : null}
							{reqUser.socialMedia.discord ? (
								<li>
									<i className="flaticon2 flaticon-twitter-logo"></i>{" "}
									{reqUser.socialMedia.discord}
								</li>
							) : null}
							{reqUser.socialMedia.discord ? (
								<li>
									<i className="flaticon2 flaticon-twitter-logo"></i>{" "}
									{reqUser.socialMedia.discord}
								</li>
							) : null}
							{reqUser.socialMedia.discord ? (
								<li>
									<i className="flaticon2 flaticon-twitter-logo"></i>{" "}
									{reqUser.socialMedia.discord}
								</li>
							) : null}
						</ul>
					</div>
				</div>

				<Divider className="mt-4 mb-4" />

				<div className="d-flex overflow-auto h-55px">
					<ul
						className="nav flex-nowrap d-flex w-100"
						style={{ justifyContent: "space-evenly" }}
					>
						<li className="nav-item active">
							<a className="nav-link text-active-primary me-6 active" href="#">
								Overview
							</a>
						</li>

						<li className="nav-item">
							<a className="nav-link text-active-primary me-6" href="#">
								Games
							</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
