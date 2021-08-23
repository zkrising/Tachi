import React from "react";
import { Header } from "./header/Header";
import { HeaderMobile } from "./header/HeaderMobile";
import { Footer } from "./footer/Footer";
import { LayoutInit } from "../../_metronic/layout/components/LayoutInit";
import { SubHeader } from "./subheader/SubHeader";
import { AnimateLoading } from "../../_metronic/_partials/controls";
import { JustChildren } from "types/react";
import BackgroundImage from "components/layout/misc/BackgroundImage";
import { BackgroundContextProvider } from "context/BackgroundContext";

export function Layout({ children }: JustChildren) {
	return (
		<>
			<AnimateLoading />

			<HeaderMobile />

			<div className="d-flex flex-column flex-root">
				<div className="d-flex flex-row flex-column-fluid page">
					<div className="d-flex flex-column flex-row-fluid wrapper" id="kt_wrapper">
						<Header />

						<BackgroundContextProvider>
							<BackgroundImage />

							<div
								id="kt_content"
								className="content d-flex flex-column flex-column-fluid"
							>
								<SubHeader />

								<div className="container">{children}</div>
							</div>
						</BackgroundContextProvider>

						<Footer />
					</div>
				</div>
			</div>

			<LayoutInit />
		</>
	);
}
