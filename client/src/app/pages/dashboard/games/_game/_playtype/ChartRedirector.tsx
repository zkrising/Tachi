import { CreateChartLink } from "util/data";
import { ErrorPage } from "app/pages/ErrorPage";
import useApiQuery from "components/util/query/useApiQuery";
import React from "react";
import { Redirect, useParams } from "react-router-dom";
import { GamePT } from "types/react";
import { ChartDocument, SongDocument } from "tachi-common";
import Loading from "components/util/Loading";

// Redirects a user from /charts/:chartID to the correct /songs/:songID/:difficulty
// url
export default function ChartRedirector({ game, playtype }: GamePT) {
	const { chartID } = useParams<{ chartID: string }>();

	const { data, error } = useApiQuery<{
		song: SongDocument;
		chart: ChartDocument;
	}>(`/games/${game}/${playtype}/charts/${chartID}`);

	if (error) {
		return <ErrorPage statusCode={error.statusCode} customMessage={error.description} />;
	}

	if (!data) {
		return <Loading />;
	}

	return <Redirect to={CreateChartLink(data.chart, game)} />;
}
