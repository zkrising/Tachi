import { MaterialThemeProvider } from "components/layout/misc/MaterialThemeProvider";
import { LoadingScreen } from "components/layout/screens/LoadingScreen";
import { AllLUGPTStatsContextProvider } from "context/AllLUGPTStatsContext";
import { BannedContextProvider } from "context/BannedContext";
import { NotificationsContextProvider } from "context/NotificationsContext";
import { SubheaderContextProvider } from "context/SubheaderContext";
import { UserContextProvider } from "context/UserContext";
import { UserSettingsContextProvider } from "context/UserSettingsContext";
import React from "react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import { WindowContextProvider } from "context/WindowContext";
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
						<NotificationsContextProvider>
							<UserSettingsContextProvider>
								<AllLUGPTStatsContextProvider>
									<LoadingScreen>
										<BrowserRouter basename={basename}>
											<WindowContextProvider>
												<MaterialThemeProvider>
													<Toaster />
													<SubheaderContextProvider>
														<Routes />
													</SubheaderContextProvider>
												</MaterialThemeProvider>
											</WindowContextProvider>
										</BrowserRouter>
									</LoadingScreen>
								</AllLUGPTStatsContextProvider>
							</UserSettingsContextProvider>
						</NotificationsContextProvider>
					</UserContextProvider>
				</BannedContextProvider>
			</QueryClientProvider>
		</React.StrictMode>
	);
}
