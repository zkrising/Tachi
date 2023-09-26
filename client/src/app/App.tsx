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
			<WindowContextProvider>
				<QueryClientProvider client={queryClient}>
					<BannedContextProvider>
						<UserContextProvider>
							<LoadingScreen>
								<NotificationsContextProvider>
									<UserSettingsContextProvider>
										<AllLUGPTStatsContextProvider>
											<BrowserRouter basename={basename}>
												<MaterialThemeProvider>
													<Toaster />
													<SubheaderContextProvider>
														<Routes />
													</SubheaderContextProvider>
												</MaterialThemeProvider>
											</BrowserRouter>
										</AllLUGPTStatsContextProvider>
									</UserSettingsContextProvider>
								</NotificationsContextProvider>
							</LoadingScreen>
						</UserContextProvider>
					</BannedContextProvider>
				</QueryClientProvider>
			</WindowContextProvider>
		</React.StrictMode>
	);
}
