import BackgroundImage from "components/layout/misc/BackgroundImage";
import { BackgroundContextProvider } from "context/BackgroundContext";
import React, { useState } from "react";
import { JustChildren } from "types/react";
import { Footer } from "./footer/Footer";
import { Header } from "./header/Header";
import { HeaderMobile } from "./header/HeaderMobile";
import { SubHeader } from "./subheader/SubHeader";

export function Layout({ children }: JustChildren) {
	const [mobileShow, setMobileShow] = useState(false);

	return (
		<>
			<HeaderMobile setMobileShow={setMobileShow} mobileShow={mobileShow} />

			<div className="d-flex flex-column flex-root">
				<div className="d-flex flex-row flex-column-fluid page">
					<div
						className="d-flex flex-column flex-row-fluid wrapper"
						id="kt_wrapper"
						style={{ overflowX: "hidden" }}
					>
						<Header mobileShow={mobileShow} setMobileShow={setMobileShow} />

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
		</>
	);
}
