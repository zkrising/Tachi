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

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } } });

export default function App({ basename }: { basename: string }) {
	return (
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				<UserContextProvider>
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
				</UserContextProvider>
			</QueryClientProvider>
		</React.StrictMode>
	);
}
