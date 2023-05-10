import BackgroundImage from "components/layout/misc/BackgroundImage";
import { BackgroundContextProvider } from "context/BackgroundContext";
import React from "react";
import { JustChildren } from "types/react";
import { Footer } from "./footer/Footer";
import { Header } from "./header/Header";
import { SubHeader } from "./subheader/SubHeader";

export function Layout({ children }: JustChildren) {
	return (
		<>
			<BackgroundContextProvider>
				<BackgroundImage />

				<Header />

				<div id="tachi-content" className="container flex-column flex-column-fluid">
					<SubHeader />

					<div>{children}</div>
				</div>

				<Footer />
			</BackgroundContextProvider>
		</>
	);
}
