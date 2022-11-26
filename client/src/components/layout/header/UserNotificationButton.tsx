import Icon from "components/util/Icon";
import useApiQuery from "components/util/query/useApiQuery";
import { NotificationsContext } from "context/NotificationsContext";
import React, { useContext, useMemo } from "react";
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
		<div className="topbar-item">
			<Link to={"/dashboard/notifications"}>
				<div
					className="btn btn-icon btn-hover-transparent-white btn-dropdown btn-lg mr-1"
					id="kt_quick_notifications_toggle"
				>
					{unread > 0 ? (
						<Icon type="envelope" colour="primary" />
					) : (
						<Icon type="envelope" regular colour="muted" />
					)}
				</div>
			</Link>
		</div>
	);
}
