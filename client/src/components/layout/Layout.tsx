import useBreakpoint from "util/useBreakpoint";
import { Breakpoints } from "util/constants/breakpoints";
import React from "react";
import { JustChildren } from "types/react";
import { BackgroundContextProvider } from "context/BackgroundContext";
import BackgroundImage from "components/layout/misc/BackgroundImage";
import Container from "react-bootstrap/Container";
import { Footer } from "./footer/Footer";
import Header from "./header/Header";
import { SubHeader } from "./subheader/SubHeader";

export type LayoutStyles = {
	height: number;
	margin: string;
};

export function Layout({ children }: JustChildren) {
	const breakpoint = useBreakpoint();
	const styles = {
		height: breakpoint < Breakpoints.md ? 125 : 200,
		margin: breakpoint < Breakpoints.md ? "55px" : "80px",
	};
	return (
		<div id="main-wrapper" className="d-flex flex-column overflow-x-hidden min-vh-100">
			<Header breakpoint={breakpoint} />

			<BackgroundContextProvider>
				<BackgroundImage styles={styles} />
				<SubHeader styles={styles} />

				<Container as="main" className="mt-8 d-flex flex-column flex-grow-1">
					{children}
				</Container>
			</BackgroundContextProvider>

			<Footer />
		</div>
	);
}
