import { MaterialThemeProvider } from "components/layout/misc/MaterialThemeProvider";
import { LoadingScreen } from "components/layout/screens/LoadingScreen";
import { BannedContextProvider } from "context/BannedContext";
import { SubheaderContextProvider } from "context/SubheaderContext";
import { UserContextProvider } from "context/UserContext";
import { UserGameStatsContextProvider } from "context/UserGameStatsContext";
import { UserSettingsContextProvider } from "context/UserSettingsContext";
import React from "react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import { Routes } from "./routes/AppRoutes";

const queryClient = new QueryClient({
	defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: false } },
});

export default function App({ basename }: { basename: string }) {
	return (
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				<BannedContextProvider>
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
				</BannedContextProvider>
			</QueryClientProvider>
		</React.StrictMode>
	);
}
