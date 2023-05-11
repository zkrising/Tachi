import BackgroundImage from "components/layout/misc/BackgroundImage";
import { BackgroundContextProvider } from "context/BackgroundContext";
import React from "react";
import { JustChildren } from "types/react";
import Container from "react-bootstrap/Container";
import { Footer } from "./footer/Footer";
import { Header } from "./header/Header";
import { SubHeader } from "./subheader/SubHeader";

export function Layout({ children }: JustChildren) {
	return (
		<>
			<BackgroundContextProvider>
				<BackgroundImage />

				<Header />

				<Container id="tachi-content">
					<SubHeader />

					{children}
				</Container>

				<Footer />
			</BackgroundContextProvider>
		</>
	);
}
