import { APIFetchV1 } from "util/api";
import { UserContext } from "context/UserContext";
import { TachiConfig } from "lib/config";
import React, { useContext, useEffect, useState } from "react";
import { UserDocument, UserSettingsDocument } from "tachi-common";
import { JustChildren } from "types/react";
import { UserSettingsContext } from "context/UserSettingsContext";
import { SplashScreen } from "./SplashScreen";

export function LoadingScreen({ children }: JustChildren) {
	const [loading, setLoading] = useState(true);
	// if we've been waiting around for too long, maybe we're down.
	const [broke, setBroke] = useState("");

	const { setUser } = useContext(UserContext);
	const { setSettings } = useContext(UserSettingsContext);

	useEffect(() => {
		if (!localStorage.getItem("isLoggedIn")) {
			setLoading(false);
			return;
		}

		const timeout = setTimeout(
			() =>
				setBroke(
					`It's taking a long time for ${TachiConfig.name} to load. We might be under strain, or completely down, sorry!`
				),
			4_000
		);

		APIFetchV1<UserDocument>("/users/me")
			.then((rj) => {
				if (rj.success) {
					setUser(rj.body);
					return rj.body;
				} else {
					localStorage.removeItem("isLoggedIn");
					return null;
				}
			})
			.then((user) => {
				if (user !== null) {
					APIFetchV1<UserSettingsDocument>(`/users/${user.id}/settings`)
						.then((rj) => {
							if (rj.success) {
								setSettings(rj.body);
							} else {
								setSettings(null);
							}
							setLoading(false);
						})
						.catch((err) => {
							console.error(err);
							setBroke(
								`${TachiConfig.name} is currently down, sadly. Check back in a while, or we might be doing a quick server restart. Sorry!`
							);
							clearTimeout(timeout);
						});
				} else {
					setLoading(false);
					clearTimeout(timeout);
				}
			})
			.catch((err) => {
				console.error(err);
				setBroke(
					`${TachiConfig.name} is currently down, sadly. Check back in a while, or we might be doing a quick server restart. Sorry!`
				);
				clearTimeout(timeout);
			});
	}, []);

	if (loading) {
		return <SplashScreen broke={broke} />;
	}

	return <>{children}</>;
}
