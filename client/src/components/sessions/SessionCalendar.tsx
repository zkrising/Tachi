import { ChangeOpacity } from "util/color-opacity";
import { EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import QuickTooltip from "components/layout/misc/QuickTooltip";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import LinkButton from "components/util/LinkButton";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import React from "react";
import { Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { COLOUR_SET, SessionDocument } from "tachi-common";
import { SessionReturns } from "types/api-returns";
import { UGPT } from "types/react";
import SessionRaiseBreakdown from "./SessionRaiseBreakdown";

type MinSession = Pick<
	SessionDocument,
	"sessionID" | "name" | "desc" | "highlight" | "timeStarted" | "timeEnded"
>;

export default function SessionCalendar({ game, playtype, reqUser }: UGPT) {
	const { data, error } = useApiQuery<Array<MinSession>>(
		`/users/${reqUser.id}/games/${game}/${playtype}/sessions/calendar`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	return (
		<FullCalendar
			plugins={[dayGridPlugin]}
			initialView="dayGridMonth"
			events={data.map(convertSession)}
			eventContent={(e) => (
				<QuickTooltip
					delay={100}
					max
					tooltipContent={
						<SessionTooltip
							reqUser={reqUser}
							game={game}
							playtype={playtype}
							sessionID={e.event.extendedProps.sessionID}
						/>
					}
					style={{
						width: "800px",
					}}
				>
					<Link
						className="w-100"
						to={`/u/${reqUser.username}/games/${game}/${playtype}/sessions/${e.event.extendedProps.sessionID}`}
					>
						<div
							className="rounded m-1"
							style={{
								backgroundColor: ChangeOpacity(
									e.event.extendedProps.highlight
										? COLOUR_SET.gold
										: COLOUR_SET.gray,
									0.2
								),
							}}
						>
							<div
								className="p-2"
								style={{
									whiteSpace: "pre-wrap",
									color: "white",
								}}
							>
								<b style={{ color: "white" }}>{e.event.title}</b>
								{e.event.extendedProps.desc && (
									<>
										<br />
										<span>{e.event.extendedProps.desc}</span>
									</>
								)}
							</div>
						</div>
					</Link>
				</QuickTooltip>
			)}
		/>
	);
}

function SessionTooltip({ sessionID, game, playtype, reqUser }: { sessionID: string } & UGPT) {
	const { data, error } = useApiQuery<SessionReturns>(`/sessions/${sessionID}`);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	return (
		<div
			className="w-100 d-flex align-items-center"
			style={{
				flexDirection: "column",
			}}
		>
			<div className="w-100">
				<h4 className="text-center">{data.session.name}</h4>
				{data.session.desc && <Muted>{data.session.desc}</Muted>}
				<Divider />
			</div>
			<Row className="w-100" style={{ maxHeight: "500px", overflowY: "scroll" }}>
				<SessionRaiseBreakdown noHeader sessionData={data} />
			</Row>
			<div className="w-100 text-center">
				<Divider />
				<LinkButton
					to={`/u/${reqUser.username}/games/${game}/${playtype}/sessions/${sessionID}`}
				>
					View Session
				</LinkButton>
			</div>
		</div>
	);
}

function convertSession(min: MinSession): EventInput {
	return {
		start: min.timeStarted,
		end: min.timeEnded,
		title: min.name,
		extendedProps: {
			desc: min.desc,
			highlight: min.highlight,
			sessionID: min.sessionID,
		},
	};
}

// {
//     "event": {
//         "title": "The Return.",
//         "start": "2021-12-14T15:46:09.086Z",
//         "end": "2021-12-14T17:54:02.697Z"
//     },
//     "view": {
//         "type": "dayGridMonth",
//         "dateEnv": {
//             "timeZone": "local",
//             "canComputeOffset": true,
//             "calendarSystem": {},
//             "locale": {
//                 "codeArg": "en",
//                 "codes": [
//                     "en"
//                 ],
//                 "week": {
//                     "dow": 0,
//                     "doy": 4
//                 },
//                 "simpleNumberFormat": {},
//                 "options": {
//                     "direction": "ltr",
//                     "buttonText": {
//                         "prev": "prev",
//                         "next": "next",
//                         "prevYear": "prev year",
//                         "nextYear": "next year",
//                         "year": "year",
//                         "today": "today",
//                         "month": "month",
//                         "week": "week",
//                         "day": "day",
//                         "list": "list"
//                     },
//                     "weekText": "W",
//                     "weekTextLong": "Week",
//                     "closeHint": "Close",
//                     "timeHint": "Time",
//                     "eventHint": "Event",
//                     "allDayText": "all-day",
//                     "moreLinkText": "more",
//                     "noEventsText": "No events to display",
//                     "buttonHints": {
//                         "prev": "Previous $0",
//                         "next": "Next $0"
//                     },
//                     "viewHint": "$0 view",
//                     "navLinkHint": "Go to $0"
//                 }
//             },
//             "weekDow": 0,
//             "weekDoy": 4,
//             "weekText": "W",
//             "weekTextLong": "Week",
//             "cmdFormatter": null,
//             "defaultSeparator": " - "
//         }
//     },
//     "timeText": "3:46p",
//     "textColor": "",
//     "backgroundColor": "",
//     "borderColor": "",
//     "isDraggable": false,
//     "isStartResizable": false,
//     "isEndResizable": false,
//     "isMirror": false,
//     "isStart": true,
//     "isEnd": true,
//     "isPast": true,
//     "isFuture": false,
//     "isToday": false,
//     "isSelected": false,
//     "isDragging": false,
//     "isResizing": false
// }
