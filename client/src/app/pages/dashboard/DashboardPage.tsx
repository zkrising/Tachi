import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import LinkButton from "components/util/LinkButton";
import SplashText from "components/util/SplashText";
import { UserContext } from "context/UserContext";
import { UserGameStatsContext } from "context/UserGameStatsContext";
import { UserSettingsContext } from "context/UserSettingsContext";
import { TachiConfig } from "lib/config";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { PublicUserDocument } from "tachi-common";
import { ToCDNURL } from "util/api";

export function DashboardPage() {
	const { settings } = useContext(UserSettingsContext);

	useSetSubheader("Dashboard", [settings]);

	const { user } = useContext(UserContext);
	const { ugs } = useContext(UserGameStatsContext);

	if (!user) {
		return <DashboardNotLoggedIn />;
	} else if (user && !ugs) {
		return <DashboardLoggedInNoScores user={user} />;
	}

	return <DashboardLoggedIn user={user} />;
}

function DashboardLoggedIn({ user }: { user: PublicUserDocument }) {
	return (
		<div>
			<span className="display-4">Welcome Back, {user.username}.</span>
		</div>
	);
}

function DashboardNotLoggedIn() {
	return (
		<div style={{ fontSize: "1.3rem" }}>
			<h1 className="mb-4">Welcome to {TachiConfig.name}!</h1>
			<h4>
				Looks like you're not logged in. If you've got an account,{" "}
				<Link to="/login">Login!</Link>
			</h4>
			<Divider />
			<h1 className="my-4">I'm New Around Here, What is this?</h1>
			<span>
				<b>{TachiConfig.name}</b> is a Rhythm Game Score Tracker. That means we...
			</span>
			<Divider />
			<FeatureContainer
				tagline="Track Your Scores."
				description={`${TachiConfig.name} supports a bunch of your favourite games, and integrates with many existing services to make sure no score is lost to the void. Furthermore, it's backed by an Open-Source API, so your scores are always available!`}
			/>
			<FeatureContainer
				tagline="Analyse Your Scores."
				description={`${TachiConfig.name} analyses your scores for you, breaking them down into all the statistics you'll ever need. No more spreadsheets!`}
			/>
			<FeatureContainer
				tagline="Provide Cool Features."
				description={`${TachiConfig.name} implements the features rhythm gamers already talk about. Break your scores down into sessions, Showcase your best metrics on your profile, study your progress on folders - it's all there, and done for you!`}
			/>
			<Divider />
			<div className="col-12 text-center" style={{ paddingTop: 50, height: 250 }}>
				Interested? You can register right now for <b>free</b>!
				<br />
				<LinkButton to="/register" className="mt-4 btn-outline-primary">
					Register!
				</LinkButton>
			</div>
		</div>
	);
}

function FeatureContainer({ tagline, description }: { tagline: string; description: string }) {
	return (
		<div className="row my-4" style={{ lineHeight: "1.3", fontSize: "1.15rem" }}>
			<div className="col-12 col-lg-6">
				<h1 className="display-4">{tagline}</h1>
				<span>{description}</span>
			</div>
		</div>
	);
}

function DashboardLoggedInNoScores({ user }: { user: PublicUserDocument }) {
	return <span>foo</span>;
}
