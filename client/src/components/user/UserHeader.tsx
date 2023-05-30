import { APIFetchV1 } from "util/api";
import { FormatDate } from "util/time";
import { TruncateString, CopyTextToClipboard } from "util/misc";
import Navbar from "components/nav/Navbar";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import Muted from "components/util/Muted";
import { UserContext } from "context/UserContext";
import { ClientConfig } from "lib/config";
import React, { useContext, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/esm/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import Collapse from "react-bootstrap/Collapse";
import { UserAuthLevels, UserDocument } from "tachi-common";
import { SetState } from "types/react";
import FollowUserButton from "components/util/FollowUserButton";
import useBreakpoint from "components/util/useBreakpoint";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import ProfileBadges from "./ProfileBadges";
import ProfilePicture from "./ProfilePicture";

export function UserHeaderBody({ reqUser }: { reqUser: UserDocument }) {
	const ConditionalSocialMediaRender = React.memo(
		({
			mode,
			href,
			className = "",
		}: {
			mode: "discord" | "twitter" | "github" | "steam" | "youtube" | "twitch";
			href?: string;
			className?: string;
		}) => {
			if (!reqUser.socialMedia[mode]) {
				return null;
			}

			const max = 19;

			return (
				<div className="text-end d-flex flex-md-row-reverse align-items-center justify-content-start my-1 overflow-hidden">
					<Icon brand type={mode} className="mx-2" />
					<QuickTooltip
						className="d-none d-md-block"
						tooltipContent={
							typeof reqUser.socialMedia[mode] === "string" &&
							(reqUser.socialMedia[mode] ?? "").length > max ? (
								mode !== "discord" ? (
									reqUser.socialMedia[mode]!
								) : (
									<>
										<div>{reqUser.socialMedia[mode]!}</div>
										<Muted>Click to copy</Muted>
									</>
								)
							) : mode === "discord" && reqUser.socialMedia.discord ? (
								<>
									<Muted>Click to copy</Muted>
								</>
							) : undefined
						}
					>
						<a
							target="_blank"
							rel="noopener noreferrer"
							className={`gentle-link ${className}`}
							href={href ? href + reqUser.socialMedia[mode] : undefined}
							onClick={() =>
								mode === "discord" &&
								CopyTextToClipboard(reqUser.socialMedia.discord)
							}
						>
							<small>
								{typeof reqUser.socialMedia[mode] === "string"
									? TruncateString(reqUser.socialMedia[mode]!, max)
									: undefined}
							</small>
						</a>
					</QuickTooltip>
				</div>
			);
		}
	);

	const SocialMediaCluster = React.memo(() => (
		<>
			<Row xs="2" className="ms-lg-8 ms-xl-10">
				<ConditionalSocialMediaRender mode="discord" className="cursor-pointer" />
				<ConditionalSocialMediaRender href="https://github.com/" mode="github" />
				<ConditionalSocialMediaRender href="https://steamcommunity.com/id/" mode="steam" />
				<ConditionalSocialMediaRender href="https://twitch.tv/" mode="twitch" />
				<ConditionalSocialMediaRender href="https://twitter.com/" mode="twitter" />
				<ConditionalSocialMediaRender href="https://youtube.com/channel/" mode="youtube" />
			</Row>
		</>
	));

	const { user: loggedInUser } = useContext(UserContext);

	const { isMd, isLg } = useBreakpoint();

	const [socialShow, setSocialShow] = useState(false);
	const [adminShow, setAdminShow] = useState(false);

	const hasSocialMediaLinks =
		reqUser.socialMedia && Object.values(reqUser.socialMedia).some((link) => link !== null);

	return (
		<>
			<Row
				xs="1"
				lg="2"
				id={`${reqUser.username}-info`}
				className="pt-6 justify-content-between"
			>
				<Col className="d-flex">
					<ProfilePicture user={reqUser} isSupporter={reqUser.isSupporter} />
					<Col className="d-flex ms-4 flex-column flex-lg-column-reverse">
						<div className="d-flex align-items-start align-items-md-center mb-2 mb-lg-0">
							<h3 className="enable-rfs overflow-hidden flex-grow-1 flex-md-grow-0 m-0">
								{reqUser.username}
							</h3>
							<div className="text-end text-md-start">
								{loggedInUser && reqUser.id !== loggedInUser.id && (
									<FollowUserButton
										userToFollow={reqUser}
										className="ms-2"
										tooltipClassName="d-none d-md-block"
										tooltipPlacement="top"
									/>
								)}
							</div>
						</div>
						<div className="flex-grow-1 flex-lg-grow-0">
							<StatusComponent reqUser={reqUser} />
						</div>
						<div className="flex-lg-grow-1">
							<Muted>Joined on {FormatDate(reqUser.joinDate)}</Muted>
						</div>
					</Col>
					{isMd && !isLg && hasSocialMediaLinks && (
						<Col>
							<SocialMediaCluster />
						</Col>
					)}
				</Col>
				<Col
					lg="5"
					className="d-flex flex-column align-items-start align-items-lg-end justify-content-between"
				>
					{isLg && hasSocialMediaLinks && <SocialMediaCluster />}
					<div className="d-flex mt-1 mt-lg-0 flex-wrap justify-content-start justify-content-lg-end">
						<ProfileBadges user={reqUser} />
					</div>
				</Col>
				{!isMd && hasSocialMediaLinks && (
					<Col className="d-flex justify-content-center mt-2 flex-column">
						<Col
							className="text-center lh-sm user-select-none cursor-pointer"
							onClick={() => setSocialShow(!socialShow)}
						>
							<small>Socials</small>
							<br />
							<Icon
								type="chevron-down"
								className="animate-rotate-180"
								show={socialShow}
							/>
						</Col>

						<Col>
							<Collapse in={socialShow}>
								<div>
									<SocialMediaCluster />
								</div>
							</Collapse>
						</Col>
					</Col>
				)}
			</Row>

			{loggedInUser?.authLevel === UserAuthLevels.ADMIN && (
				<>
					<Divider />
					{reqUser.isSupporter ? (
						<div className="text-end">
							<Button
								size="sm"
								variant="danger"
								onClick={() => setAdminShow(true)}
								className="text-end me-2 cursor-pointer"
							>
								<small>Remove Supporter Rank?</small>
							</Button>
							<AdminModal
								show={adminShow}
								setShow={setAdminShow}
								confirmText="Remove Supporter Rank"
								confirmVariant="danger"
								id={reqUser.id}
								method="DELETE"
							/>
						</div>
					) : (
						<div className="text-end">
							<Button
								size="sm"
								variant="success"
								onClick={() => setAdminShow(true)}
								className="me-2 cursor-pointer"
							>
								<small>Make Supporter?</small>
							</Button>
							<AdminModal
								show={adminShow}
								setShow={setAdminShow}
								confirmText="Make Supporter"
								confirmVariant="success"
								id={reqUser.id}
								method="POST"
							/>
						</div>
					)}
				</>
			)}
		</>
	);
}

export function UserBottomNav({ baseUrl, reqUser }: { baseUrl: string; reqUser: UserDocument }) {
	const { user } = useContext(UserContext);

	const isRequestedUser = !!(user && user.id === reqUser.id);

	const navItems = [
		<Navbar.Item key="about" to={`${baseUrl}`}>
			Overview
		</Navbar.Item>,
		<Navbar.Item key="games" to={`${baseUrl}/games`}>
			Games
		</Navbar.Item>,
	];

	if (isRequestedUser) {
		navItems.push(
			<Navbar.Item key="integrations" to={`${baseUrl}/integrations`}>
				Service Integrations
			</Navbar.Item>
		);
		navItems.push(
			<Navbar.Item key="imports" to={`${baseUrl}/imports`}>
				Imports
			</Navbar.Item>
		);

		// If mandates login, assume that we also use invite codes.
		// I'm sure we could set up an elaborate way of doing this by
		// querying the server, but I just don't care.
		if (ClientConfig.MANDATE_LOGIN) {
			navItems.push(
				<Navbar.Item key="invites" to={`${baseUrl}/invites`}>
					Invites
				</Navbar.Item>
			);
		}

		navItems.push(
			<Navbar.Item key="settings" to={`${baseUrl}/settings`}>
				Profile Settings
			</Navbar.Item>
		);
	}

	return <Navbar>{navItems}</Navbar>;
}

function StatusComponent({ reqUser }: { reqUser: UserDocument }) {
	const { user } = useContext(UserContext);

	const isRequestedUser = user?.id === reqUser.id;

	const [modalShow, setModalShow] = useState(false);

	return (
		<div className="fw-light mb-1">
			{reqUser.status ? (
				<span>{reqUser.status}</span>
			) : (
				<Muted>
					{isRequestedUser ? "You have" : `${reqUser.username} has`} no status...
				</Muted>
			)}

			{isRequestedUser && (
				<span
					className="position-absolute"
					onClick={() => setModalShow(true)}
					style={{ transform: "translateX(.4em) translateY(-.6em)" }}
				>
					<QuickTooltip tooltipContent={"Change status"} className="d-none d-md-block">
						<span>
							<Icon
								type="pencil"
								className="cursor-pointer"
								noPad
								style={{
									fontSize: "12px",
								}}
							/>
						</span>
					</QuickTooltip>
				</span>
			)}

			{/* <div className="col-12">
				<Muted>Last Seen: {MillisToSince(reqUser.lastSeen)}</Muted>
			</div> */}
			<ChangeStatusModal
				reqUser={reqUser}
				modalShow={modalShow}
				setModalShow={setModalShow}
			/>
		</div>
	);
}

function ChangeStatusModal({
	modalShow,
	setModalShow,
	reqUser,
}: {
	modalShow: boolean;
	setModalShow: SetState<boolean>;
	reqUser: UserDocument;
}) {
	const [status, setStatus] = useState(reqUser.status);
	const [innerStatus, setInnerStatus] = useState(reqUser.status ?? "");

	return (
		<Modal
			show={modalShow}
			onHide={() => setModalShow(false)}
			centered
			backdropClassName="tachi-backdrop"
		>
			<Modal.Header closeButton>
				<Modal.Title>Change Status</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form
					onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
						e.preventDefault();

						APIFetchV1(
							"/users/me",
							{
								method: "PATCH",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									status: innerStatus || null,
								}),
							},
							true,
							true
						).then((r) => {
							if (r.success) {
								setStatus(innerStatus);
								reqUser.status = innerStatus;
								setModalShow(false);
							}
						});
					}}
				>
					<InputGroup className="mb-2">
						<Form.Control
							size="lg"
							className="form-gray-800"
							type="text"
							placeholder={status ?? "I'm gaming..."}
							value={innerStatus}
							onChange={(e) => setInnerStatus(e.target.value)}
						/>
						<Button variant="primary" type="submit">
							Submit
						</Button>
					</InputGroup>
				</Form>
			</Modal.Body>
		</Modal>
	);
}

function AdminModal({
	show,
	setShow,
	confirmText,
	confirmVariant,
	id,
	method,
}: {
	show: boolean;
	setShow: (state: boolean) => void;
	confirmText: string;
	confirmVariant: string;
	id: number;
	method: "DELETE" | "POST";
}) {
	return (
		<Modal show={show} backdropClassName="tachi-backdrop" animation centered>
			<Modal.Header className="text-center">
				<h3>Please confirm</h3>
			</Modal.Header>
			<Modal.Body className="d-flex justify-content-between">
				<Button variant="secondary" onClick={() => setShow(false)}>
					Cancel
				</Button>
				<Button
					variant={confirmVariant}
					onClick={() =>
						APIFetchV1(
							`/admin/supporter/${id}`,
							{ method: method as string },
							true,
							true
						)
							.then()
							.then(() => window.location.reload())
					}
				>
					{confirmText}
				</Button>
			</Modal.Body>
		</Modal>
	);
}
