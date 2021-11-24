import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import React from "react";
import { Button, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { integer, InviteCodeDocument, PublicUserDocument } from "tachi-common";
import { APIFetchV1 } from "util/api";
import { DelayedPageReload } from "util/misc";
import { FormatTime } from "util/time";

export default function UserInvitesPage({ reqUser }: { reqUser: PublicUserDocument }) {
	useSetSubheader(
		["Users", reqUser.username, "Invites"],
		[reqUser],
		`${reqUser.username}'s Invites`
	);

	const { data, isLoading, error } = useApiQuery<{ invites: integer; limit: integer }>(
		`/users/${reqUser.id}/invites/limit`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data || isLoading) {
		return <Loading />;
	}

	const newInvites = data.limit - data.invites;

	return (
		<Card header="Invites" className="col-12 offset-lg-2 col-lg-8">
			<Row>
				<Col xs={12} className="text-center">
					<h4 className="display-4">
						You can make <b>{newInvites}</b> invite code{newInvites !== 1 ? "s" : ""}.
					</h4>
					<h4>You get new invite codes every month.</h4>
					<span className="text-danger">
						By inviting a user, you take partial responsibility for their actions. If
						they cause trouble, you may also be in trouble.
						<br />
						Only invite people you trust!
					</span>
					<Divider />
				</Col>
				{newInvites !== 0 && (
					<Col xs={12}>
						<div className="d-flex justify-content-center">
							<Button
								onClick={async () => {
									const r = await APIFetchV1(
										`/users/${reqUser.id}/invites/create`,
										{
											method: "POST",
										},
										true,
										true
									);

									if (r.success) {
										DelayedPageReload();
									}
								}}
								className="btn btn-primary"
							>
								Create new Invite
							</Button>
						</div>
						<Divider />
					</Col>
				)}
				<Col xs={12}>
					<h4 className="text-center mb-4">Your Invites</h4>
					<InviteList reqUser={reqUser} />
				</Col>
			</Row>
		</Card>
	);
}

function InviteList({ reqUser }: { reqUser: PublicUserDocument }) {
	const { data, isLoading, error } = useApiQuery<{
		invites: InviteCodeDocument[];
		consumers: PublicUserDocument[];
	}>(`/users/${reqUser.id}/invites`);

	if (error) {
		return <ApiError error={error} />;
	}

	if (isLoading || !data) {
		return <Loading />;
	}

	const unconsumed = data.invites.filter(e => !e.consumed);
	const consumed = data.invites.filter(e => e.consumed);

	return (
		<div style={{ fontSize: "1.2rem" }}>
			<h3>Unused</h3>
			<Muted>
				These codes have not been used by anyone yet! You can send them to anyone to let
				them onto the site.
			</Muted>
			{unconsumed.length ? (
				unconsumed.map(e => (
					<div key={e.code}>
						<code>{e.code}</code>
					</div>
				))
			) : (
				<div>No Unconsumed Invites!</div>
			)}
			<h3 className="mt-4">Users you have Invited</h3>
			<div style={{ fontSize: "1.1rem" }}>
				{consumed.length ? (
					consumed.map(e => (
						<div key={e.code}>
							Invited{" "}
							<Link to={`/dashboard/users/${e.consumedBy}`}>
								{data.consumers.find(u => u.id === e.consumedBy)?.username ??
									"Unknown"}
							</Link>{" "}
							at {FormatTime(e.consumedAt || 0)}
						</div>
					))
				) : (
					<div>No-one, yet!</div>
				)}
			</div>
		</div>
	);
}
