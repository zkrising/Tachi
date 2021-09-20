import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Routes } from "./routes/AppRoutes";
import { MaterialThemeProvider } from "../_metronic/layout";
import { UserContextProvider } from "context/UserContext";
import { UserGameStatsContextProvider } from "context/UserGameStatsContext";
import { Toaster } from "react-hot-toast";
import { SubheaderContextProvider } from "context/SubheaderContext";
import { LoadingScreen } from "components/layout/screens/LoadingScreen";
import { QueryClientProvider, QueryClient } from "react-query";
import { UserSettingsContextProvider } from "context/UserSettingsContext";

const queryClient = new QueryClient({
	defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

export default function App({ basename }: { basename: string }) {
	return (
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				<UserContextProvider>
					<UserSettingsContextProvider>
						<UserGameStatsContextProvider>
							<LoadingScreen>
								<BrowserRouter basename={basename}>
									<MaterialThemeProvider>
										<Toaster />
										<SubheaderContextProvider>
											<Routes />
										</SubheaderContextProvider>
									</MaterialThemeProvider>
								</BrowserRouter>
							</LoadingScreen>
						</UserGameStatsContextProvider>
					</UserSettingsContextProvider>
				</UserContextProvider>
			</QueryClientProvider>
		</React.StrictMode>
	);
}
