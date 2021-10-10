import React, { useContext, useState } from "react";
import { PublicUserDocument, UserSettings } from "tachi-common";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import SelectButton from "components/util/SelectButton";
import Icon from "components/util/Icon";
import Divider from "components/util/Divider";
import { Alert, Button, Form } from "react-bootstrap";
import { APIFetchV1, ToAPIURL } from "util/api";
import ProfilePicture from "components/user/ProfilePicture";
import { useFormik } from "formik";
import { DelayedPageReload, FetchJSONBody, UppercaseFirst } from "util/misc";
import { TachiConfig } from "lib/config";
import { UserSettingsContext, UserSettingsContextProvider } from "context/UserSettingsContext";
import Muted from "components/util/Muted";

interface Props {
	reqUser: PublicUserDocument;
}

export default function UserSettingsPage({ reqUser }: Props) {
	useSetSubheader(
		["Users", reqUser.username, "Settings"],
		[reqUser],
		`${reqUser.username}'s Settings`
	);

	const [page, setPage] = useState<"image" | "socialMedia" | "preferences">("image");

	return (
		<Card header="Settings" className="col-12 offset-lg-2 col-lg-8">
			<div className="row">
				<div className="col-12">
					<div className="btn-group d-flex justify-content-center">
						<SelectButton value={page} setValue={setPage} id="image">
							<Icon type="image" />
							Pictures
						</SelectButton>
						<SelectButton value={page} setValue={setPage} id="socialMedia">
							<Icon type="twitter" brand />
							Social Media
						</SelectButton>
						<SelectButton value={page} setValue={setPage} id="preferences">
							<Icon type="cogs" />
							UI Preferences
						</SelectButton>
					</div>
				</div>
				<div className="col-12">
					<Divider className="mt-4 mb-4" />
					{page === "image" ? (
						<ImageForm reqUser={reqUser} />
					) : page === "socialMedia" ? (
						<SocialMediaForm reqUser={reqUser} />
					) : (
						<PreferencesForm reqUser={reqUser} />
					)}
				</div>
				<div className="col-12">
					<Divider />
					<Muted>
						Looking to change settings for a specific game? Go to your game profile, and
						select those settings!
					</Muted>
				</div>
			</div>
		</Card>
	);
}

function PreferencesForm({ reqUser }: { reqUser: PublicUserDocument }) {
	const { settings, setSettings } = useContext(UserSettingsContext);

	const formik = useFormik({
		initialValues: {
			developerMode: settings?.preferences.developerMode ?? false,
			invisible: settings?.preferences.invisible ?? false,
			contentiousContent: settings?.preferences.contentiousContent ?? false,
		},
		onSubmit: async values => {
			const res = await APIFetchV1<UserSettings>(
				`/users/${reqUser.id}/settings`,
				{
					method: "PATCH",
					...FetchJSONBody(values),
				},
				true,
				true
			);

			if (res.success) {
				setSettings(res.body);
			}
		},
	});

	return (
		<Form onSubmit={formik.handleSubmit}>
			<Form.Group>
				<Form.Check
					type="checkbox"
					id="developerMode"
					checked={formik.values.developerMode}
					onChange={formik.handleChange}
					label="Developer Mode"
				/>
				<Form.Text>Enable debug information.</Form.Text>
			</Form.Group>
			<Form.Group>
				<Form.Check
					type="checkbox"
					id="invisible"
					checked={formik.values.invisible}
					onChange={formik.handleChange}
					label="Invisible Mode"
				/>
				<Form.Text>Hide your last seen status.</Form.Text>
			</Form.Group>
			<Form.Group>
				<Form.Check
					type="checkbox"
					id="contentiousContent"
					checked={formik.values.contentiousContent}
					onChange={formik.handleChange}
					label="Family Unfriendly Mode"
				/>
				<Form.Text>
					Show slightly less appropriate splash texts in certain places.
				</Form.Text>
			</Form.Group>
			<Button type="submit">Update Settings</Button>
		</Form>
	);
}

function ImageForm({ reqUser }: { reqUser: PublicUserDocument }) {
	const [pfp, setPfp] = useState<File | undefined>();
	const [banner, setBanner] = useState<File | undefined>();

	return (
		<div>
			<Alert variant="danger">
				Remember Rule 6! Do not set inappropriate stuff as your avatar/banner. If you have
				to ask, the answer is probably no.
			</Alert>
			<Form.Group>
				<Form.Label>Profile Picture</Form.Label>
				<input
					className="form-control"
					accept="image/png,image/jpeg"
					tabIndex={1}
					type="file"
					id="pfp"
					multiple={false}
					onChange={e => setPfp(e.target.files![0])}
				/>
				<div className="d-flex justify-content-center mt-4">
					<ProfilePicture
						user={reqUser}
						src={pfp ? URL.createObjectURL(pfp) : ToAPIURL(`/users/${reqUser.id}/pfp`)}
					/>
				</div>
				<FileUploadController file={pfp} reqUser={reqUser} type="pfp" />
			</Form.Group>
			<Form.Group>
				<Form.Label>Profile Banner</Form.Label>
				<input
					className="form-control"
					accept="image/png,image/jpeg"
					tabIndex={2}
					type="file"
					id="banner"
					multiple={false}
					onChange={e => setBanner(e.target.files![0])}
				/>
				<div className="d-flex justify-content-center mt-4">
					<img
						className="rounded"
						style={{
							width: "57.6vw",
							height: "32.4vh",
							boxShadow: "0px 0px 10px 0px #000000",
						}}
						src={
							banner
								? URL.createObjectURL(banner)
								: ToAPIURL(`/users/${reqUser.id}/banner`)
						}
					/>
				</div>
				<FileUploadController file={banner} reqUser={reqUser} type="banner" />
			</Form.Group>
		</div>
	);
}

function SocialMediaForm({ reqUser }: { reqUser: PublicUserDocument }) {
	const placeholders = {
		discord: "Example#0000",
		twitter: "Twitter Handle",
		twitch: "Twitch Username",
		github: "Github Username",
		youtube: "Channel Name",
		steam: "Steam Community ID",
	};

	const formik = useFormik({
		initialValues: {
			discord: reqUser.socialMedia.discord ?? "",
			twitter: reqUser.socialMedia.twitter ?? "",
			twitch: reqUser.socialMedia.twitch ?? "",
			github: reqUser.socialMedia.github ?? "",
			steam: reqUser.socialMedia.steam ?? "",
			youtube: reqUser.socialMedia.youtube ?? "",
		},
		onSubmit: async values => {
			const valuesClone: Record<string, string | null> = {};
			for (const v in values) {
				const vx = v as keyof typeof values;
				valuesClone[vx] = values[vx] || null;
			}

			const rj = await APIFetchV1<PublicUserDocument>(
				"/users/me",
				{
					method: "PATCH",
					body: JSON.stringify(valuesClone),
					headers: {
						"Content-Type": "application/json",
					},
				},
				true,
				true
			);

			if (rj.success) {
				DelayedPageReload();
			}
		},
	});

	return (
		<Form onSubmit={formik.handleSubmit}>
			{(["discord", "twitter", "github", "steam", "youtube"] as const).map((e, i) => (
				<Form.Group key={e}>
					<Form.Label>{UppercaseFirst(e)}</Form.Label>
					<Form.Control
						tabIndex={i + 1}
						type="text"
						id={e}
						value={formik.values[e]}
						placeholder={placeholders[e]}
						onChange={formik.handleChange}
					/>
				</Form.Group>
			))}
			<Form.Group>
				<Form.Label>Twitch</Form.Label>
				<Form.Control
					tabIndex={6}
					type="text"
					id="twitch"
					value={formik.values.twitch}
					placeholder={placeholders.twitch}
					onChange={formik.handleChange}
				/>
				<Form.Text className="text-muted">
					If you are streaming a game supported by {TachiConfig.name}, your stream may
					appear on that games page!
				</Form.Text>
			</Form.Group>
			<div className="row justify-content-center">
				<Button type="submit" variant="success">
					Submit
				</Button>
			</div>
		</Form>
	);
}

function SizeWarner({ bytes, cap }: { bytes: number; cap: number }) {
	const kb = bytes / 1_000;

	let className = "text-success";

	if (kb > cap) {
		className = "text-danger";
	} else if (cap * 0.95 < kb) {
		className = "text-warning";
	}

	return (
		<span className={className}>
			{kb}kb/{cap}kb
		</span>
	);
}

function FileUploadController({
	file,
	type,
	reqUser,
}: {
	file?: File;
	type: "pfp" | "banner";
	reqUser: PublicUserDocument;
}) {
	return (
		<div className="d-flex mt-8">
			<Button
				onClick={async () => {
					const res = await APIFetchV1(
						`/users/me/${type}`,
						{ method: "DELETE" },
						true,
						true
					);

					if (res.success) {
						DelayedPageReload();
					}
				}}
				disabled={!reqUser.customPfp}
				className="mr-auto"
				variant="secondary"
			>
				Unset
			</Button>
			{file && (
				<div className="mx-auto">
					<SizeWarner bytes={file.size} cap={1024} />
				</div>
			)}
			{file && (
				<Button
					onClick={async () => {
						const formData = new FormData();
						formData.append(type, file);

						const res = await APIFetchV1(
							`/users/me/${type}`,
							{
								method: "PUT",
								body: formData,
							},
							true,
							true
						);

						if (res.success) {
							window.location.reload();
						}
					}}
					className="ml-auto"
					variant="success"
					disabled={file.size > 1024 * 1000}
				>
					Submit
				</Button>
			)}
		</div>
	);
}
