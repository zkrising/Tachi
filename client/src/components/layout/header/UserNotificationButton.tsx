import Icon from "components/util/Icon";
//import useApiQuery from "components/util/query/useApiQuery";
import { NotificationsContext } from "context/NotificationsContext";
import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
//import { NotificationDocument, UserDocument } from "tachi-common";

export function UserNotificationButton() {
	const { notifications } = useContext(NotificationsContext);

	const unread = useMemo(() => {
		if (!notifications) {
			return 0;
		}

		return notifications.filter((e) => e.read === false).length;
	}, [notifications]);

	return (
		<Link to="/notifications" className="header-icon">
			{unread > 0 ? (
				<Icon type="envelope" animation="shake" colour="primary" />
			) : (
				<Icon type="envelope" colour="muted" />
			)}
		</Link>
	);
}
