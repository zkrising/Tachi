import { APIFetchV1 } from "util/api";
import { ErrorPage } from "app/pages/ErrorPage";
import useSetSubheader from "components/layout/header/useSetSubheader";
import NotificationRow from "components/notifications/NotificationRow";
import MiniTable from "components/tables/components/MiniTable";
import ApiError from "components/util/ApiError";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import { UserContext } from "context/UserContext";
import React, { useContext, useMemo } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { NotificationDocument, PublicUserDocument } from "tachi-common";

export default function NotificationsPage() {
	const { user } = useContext(UserContext);

	useSetSubheader(["Dashboard", "Notifications"]);

	if (!user) {
		return <ErrorPage statusCode={401} />;
	}

	return <NotificationsInnerPage user={user} />;
}

function NotificationsInnerPage({ user }: { user: PublicUserDocument }) {
	const { data, error } = useApiQuery<Array<NotificationDocument>>(
		`/users/${user.id}/notifications`
	);

	const unread = useMemo(() => {
		if (!data) {
			return 0;
		}

		return data.filter((e) => e.read === false).length;
	}, [data]);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	if (data.length === 0) {
		return (
			<div className="d-flex w-100 justify-content-center">
				<div>You've got no mail!</div>
			</div>
		);
	}

	return (
		<Row>
			<Col xs={12}>
				<MiniTable headers={["Read"]}>
					{data.map((e) => (
						<NotificationRow notif={e} key={e.notifID} />
					))}
				</MiniTable>
			</Col>
			<Col xs={12}>
				<div className="w-100 d-flex">
					<div style={{ flex: 1 }}></div>
					<div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
						<Button
							onClick={async () => {
								await APIFetchV1(`/users/${user.id}/delete-all`, {
									method: "POST",
								});
							}}
							variant="outline-danger"
						>
							Clear Notifications
						</Button>
					</div>
					<div style={{ flex: 1, textAlign: "right" }}>
						{data.length} Notifications.
						{unread > 0 && (
							<>
								{" "}
								<strong>({unread} Unread)</strong>
							</>
						)}
					</div>
				</div>
			</Col>
		</Row>
	);
}
