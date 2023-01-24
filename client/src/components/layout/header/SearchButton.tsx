import Icon from "components/util/Icon";
import useApiQuery from "components/util/query/useApiQuery";
import { NotificationsContext } from "context/NotificationsContext";
import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { NotificationDocument, UserDocument } from "tachi-common";

export function SearchButton() {
	return (
		<div className="topbar-item">
			<Link to="/search">
				<div className="btn btn-icon btn-hover-transparent-white btn-dropdown btn-lg mr-1">
					<Icon type="search" colour="muted" />
				</div>
			</Link>
		</div>
	);
}
