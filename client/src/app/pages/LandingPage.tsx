import { Footer } from "components/layout/footer/Footer";
import { Header } from "components/layout/header/Header";
import { HeaderMobile } from "components/layout/header/HeaderMobile";
import Divider from "components/util/Divider";
import LinkButton from "components/util/LinkButton";
import { TachiConfig } from "lib/config";
import React from "react";
import { ToServerURL } from "util/api";
import { toAbsoluteUrl } from "_metronic/_helpers";

// This page is currently unused,
// It's alright, but hey, we could do more.
export default function LandingPage() {
	return (
		<>
			<HeaderMobile />
			<Header />
			<div className="landing-page" id="kt_content">
				<section id="hero" className="hero">
					<div
						className="hero-bg-image"
						style={{
							backgroundImage: `url(${ToServerURL("/cdn/game-banners/default")})`,
						}}
					/>
					<div
						className="hero-bg-fader"
						style={{
							backgroundImage: `url(${ToServerURL("/cdn/misc/overlay.png")})`,
						}}
					/>
					<div className="hero-content-wrapper">
						<div className="row">
							<div className="col-12 col-lg-8 offset-lg-2 d-flex align-items-center">
								<div className="row justify-content-center text-center">
									<div className="col-12 mb-8">
										<div className="d-none d-lg-block">
											<img
												src={toAbsoluteUrl(
													"/media/logos/logo-wordmark.png"
												)}
												alt={TachiConfig.name}
												width="30%"
											/>
										</div>
										<div className="d-block d-lg-none">
											<img
												src={toAbsoluteUrl(
													"/media/logos/logo-wordmark.png"
												)}
												alt={TachiConfig.name}
												width="80%"
											/>
										</div>
									</div>
									<div className="col-12">
										<h3 className="display-3">
											A <b>Supercharged</b> Score Tracker
										</h3>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
				<Divider className="mt-8 mb-16" />
				<section id="features" className="features">
					<div className="container">
						<div className="row">
							<FeatureContainer
								tagline="No More Spreadsheets."
								description={`${TachiConfig.name} analyses your scores for you, showing all the statistics you'll ever want to see.`}
							>
								<FeatureImage
									alt="Picture of scores."
									src={ToServerURL("/cdn/hero/scores.png")}
								/>
							</FeatureContainer>
							<FeatureContainer
								leftAlign={false}
								tagline="Features You'll Actually Use."
								description={`${TachiConfig.name} implements the features rhythm gamers already talk about. Break your scores down into sessions, Track goals in real time, break down your folder averages - it's all there!`}
							>
								foo
							</FeatureContainer>
							<FeatureContainer
								tagline="All Your Scores."
								description={`${TachiConfig.name} supports a bunch of your favourite games, and integrates with many existing services to make sure no score is lost to the void.`}
							>
								foo
							</FeatureContainer>
							<div
								className="col-12 text-center"
								style={{ paddingTop: 100, height: 250 }}
							>
								But hey, this all sounds a bit formal. Let's be honest, if you're a
								rhythm gamer, you probably don't need to be sold on this like it's a
								startup :P.
								<br />
								<LinkButton to="/register" className="mt-4 btn-outline-primary">
									Register?
								</LinkButton>
							</div>
						</div>
					</div>
				</section>
			</div>
			<Footer />
		</>
	);
}

function FeatureContainer({
	tagline,
	description,
	children,
	leftAlign = true,
}: {
	tagline: string;
	description: string;
	children: React.ReactChild;
	leftAlign?: boolean;
}) {
	return (
		<div className="col-12 mb-16">
			<div className="row">
				{leftAlign && (
					<div className="col-12 col-lg-6 align-self-center">
						<h1 className="display-4">{tagline}</h1>
						<h5>{description}</h5>
					</div>
				)}
				<div className="col-12 d-none d-lg-block col-lg-6 text-center">{children}</div>
				{!leftAlign && (
					<div className="col-12 col-lg-6 text-right">
						<h1 className="display-4">{tagline}</h1>
						<h5>{description}</h5>
					</div>
				)}
			</div>
		</div>
	);
}

function FeatureImage({ src, alt }: { src: string; alt: string }) {
	return <img src={src} alt={alt} />;
}
