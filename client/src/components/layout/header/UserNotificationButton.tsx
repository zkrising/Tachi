import Icon from "components/util/Icon";
import useApiQuery from "components/util/query/useApiQuery";
import { NotificationsContext } from "context/NotificationsContext";
import React, { useContext, useMemo } from "react";
import NavItem from "react-bootstrap/NavItem";
import { Link } from "react-router-dom";
import { NotificationDocument, UserDocument } from "tachi-common";

export function UserNotificationButton({ user }: { user: UserDocument }) {
	const { notifications } = useContext(NotificationsContext);

	const unread = useMemo(() => {
		if (!notifications) {
			return 0;
		}

		return notifications.filter((e) => e.read === false).length;
	}, [notifications]);

	return (
		<NavItem>
			<Link to="/notifications" className="btn btn-header btn-icon">
				{unread > 0 ? (
					<Icon type="envelope" animation="shake" colour="primary" />
				) : (
					<Icon type="envelope" colour="muted" />
				)}
			</Link>
		</NavItem>
	);
}
