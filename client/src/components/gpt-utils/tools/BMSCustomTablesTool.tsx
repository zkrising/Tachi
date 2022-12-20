import { ToAPIURL } from "util/api";
import { CopyToClipboard } from "util/misc";
import Card from "components/layout/page/Card";
import ApiError from "components/util/ApiError";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import { TachiConfig } from "lib/config";
import React from "react";
import { Col, Row } from "react-bootstrap";
import { UGPT } from "types/react";
import { GPTUtility } from "types/ugpt";
import Icon from "components/util/Icon";
import Divider from "components/util/Divider";

function Component({ game, playtype, reqUser }: UGPT) {
	const { data, error } = useApiQuery<
		Array<{
			forSpecificUser?: boolean;
			urlName: string;
			tableName: string;
			symbol: string;
			description: string;
		}>
	>(`/games/${game}/${playtype}/custom-tables`);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	return (
		<Row>
			<Col xs={12}>
				Just paste these URLs into your BMS client of choice. For LR2oraja, this is on the
				setup screen.
				<Divider />
			</Col>
			{data.map((tbl) => {
				const TABLE_URL = ToAPIURL(
					`${
						tbl.forSpecificUser ? `/users/${reqUser.username}` : ""
					}/games/bms/${playtype}/custom-tables/${tbl.urlName}`
				);

				return (
					<Col key={tbl.urlName} xs={12} lg={6}>
						<Card className="my-4" header={tbl.tableName}>
							{tbl.description}
							<br />
							<br />
							URL: <code>{TABLE_URL}</code>
							<Icon
								type="link"
								onClick={() => {
									CopyToClipboard(TABLE_URL);
								}}
							/>
						</Card>
					</Col>
				);
			})}
		</Row>
	);
}

export const BMSCustomTablesTool: GPTUtility = {
	name: `${TachiConfig.name} BMS Tables`,
	urlPath: "custom-tables",
	description: `${TachiConfig.name} has its own BMS tables that you can use in-game!`,
	component: Component,
	personalUseOnly: true,
};
