import React from "react";
import { JustChildren } from "types/react";
import { BackgroundContextProvider } from "context/BackgroundContext";
import BackgroundImage from "components/layout/misc/BackgroundImage";
import Container from "react-bootstrap/Container";
import { Footer } from "./footer/Footer";
import Header from "./header/Header";
import { SubHeader } from "./subheader/SubHeader";

export function Layout({ children }: JustChildren) {
	return (
		<div id="main-wrapper" className="d-flex flex-column overflow-x-hidden min-vh-100">
			<Header />

			<BackgroundContextProvider>
				<BackgroundImage />

				<Container as="main" className="pt-8 d-flex flex-column flex-grow-1">
					<SubHeader />

					{children}
				</Container>
			</BackgroundContextProvider>

			<Footer />
		</div>
	);
}
