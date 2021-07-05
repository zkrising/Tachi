import React, { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { Routes } from "./AppRoutes";
import { LayoutSplashScreen, MaterialThemeProvider } from "../_metronic/layout";

export default function App({ basename }: { basename: string }) {
	return (
		<Suspense fallback={<LayoutSplashScreen />}>
			<BrowserRouter basename={basename}>
				<MaterialThemeProvider>
					<Routes />
				</MaterialThemeProvider>
			</BrowserRouter>
		</Suspense>
	);
}
