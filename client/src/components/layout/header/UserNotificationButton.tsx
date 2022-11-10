import Icon from "components/util/Icon";
import useApiQuery from "components/util/query/useApiQuery";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { NotificationDocument, UserDocument } from "tachi-common";

export function UserNotificationButton({ user }: { user: UserDocument }) {
	// don't care whether it errors or not, tbh
	const { data } = useApiQuery<Array<NotificationDocument>>(`/users/${user.id}/notifications`);

	const unread = useMemo(() => {
		if (!data) {
			return 0;
		}

		return data.filter((e) => e.read === false).length;
	}, [data]);

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
