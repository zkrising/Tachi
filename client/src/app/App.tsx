import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Routes } from "./AppRoutes";
import {
	MaterialThemeProvider,
	LoadingScreen,
	MetronicSubheaderProvider,
} from "../_metronic/layout";
import { UserContextProvider } from "context/UserContext";
import { Toaster } from "react-hot-toast";

export default function App({ basename }: { basename: string }) {
	return (
		<UserContextProvider>
			<LoadingScreen>
				<MetronicSubheaderProvider>
					<BrowserRouter basename={basename}>
						<MaterialThemeProvider>
							<Toaster />
							<Routes />
						</MaterialThemeProvider>
					</BrowserRouter>
				</MetronicSubheaderProvider>
			</LoadingScreen>
		</UserContextProvider>
	);
}
