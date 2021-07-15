import { UserContext } from "context/UserContext";
import React, { useContext, useState, useEffect } from "react";
import { PublicUserDocument } from "tachi-common";
import { JustChildren } from "types/react";
import { APIFetchV1 } from "util/api";
import { SplashScreen } from "./SplashScreen";

export function LoadingScreen({ children }: JustChildren) {
	const [loading, setLoading] = useState(true);
	// if we've been waiting around for too long, maybe we're down.
	const [broke, setBroke] = useState("");

	const { setUser } = useContext(UserContext);

	useEffect(() => {
		const timeout = setTimeout(
			() =>
				setBroke(
					"It's taking a long time for Kamaitachi to load. We might be under strain, or completely down, sorry!"
				),
			4_000
		);

		Promise.all([
			APIFetchV1<PublicUserDocument>("/users/me").then(rj => {
				if (rj.success) {
					setUser(rj.body);
				}
			}),
		])
			.then(() => {
				setLoading(false);
				clearTimeout(timeout);
			})
			.catch(err => {
				console.error(err);
				setBroke(
					"A network error has occured while loading Kamaitachi. If you think this is on your end, try reloading the page. If you think it isn't, report this."
				);
				clearTimeout(timeout);
			});
	}, []);

	if (loading) {
		return <SplashScreen broke={broke} />;
	}

	return <>{children}</>;
}
