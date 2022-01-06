import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import Muted from "components/util/Muted";
import { UserContext } from "context/UserContext";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import { PublicUserDocument } from "tachi-common";
import { APIFetchV1 } from "util/api";

interface Props {
	reqUser: PublicUserDocument;
}

export default function UserPage({ reqUser }: Props) {
	useSetSubheader(["Users", reqUser.username], [reqUser], `${reqUser.username}'s Profile`);

	return <AboutMeCard reqUser={reqUser} />;
}

function AboutMeCard({ reqUser }: Props) {
	const { user } = useContext(UserContext);

	const [editMode, setEditMode] = useState(false);
	const [content, setContent] = useState(reqUser.about);

	async function SubmitNewAboutMe() {
		const res = await APIFetchV1(
			`/users/${user!.id}`,
			{
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ about: content }),
			},
			true,
			true
		);

		if (res.success) {
			setEditMode(false);
		}
	}

	useEffect(() => {
		if (
			editMode &&
			(content === "<script>alert(1)</script>" || content === "<script>alert(1);</script>")
		) {
			alert(`1\n\n\n...Just kidding, this is an easter egg :)`);
		}
	}, [content]);

	let footer = <></>;

	if (user?.id === reqUser.id) {
		if (!editMode) {
			footer = (
				<div className="d-flex justify-content-end">
					<Button onClick={() => setEditMode(true)} variant="info">
						Edit
					</Button>
				</div>
			);
		} else {
			footer = (
				<div className="d-flex">
					<Button
						className="mr-auto"
						onClick={() => {
							setEditMode(false);
							setContent(reqUser.about);
						}}
						variant="secondary"
					>
						Cancel
					</Button>
					<Button
						className="ml-auto"
						onClick={() => SubmitNewAboutMe()}
						variant="success"
					>
						Submit
					</Button>
				</div>
			);
		}
	}

	return (
		<Card header="About Me" footer={footer}>
			{editMode && (
				<>
					<textarea
						style={{ height: 200 }}
						className="w-100"
						value={content}
						onChange={e => setContent(e.target.value)}
					/>
					<Muted>
						You can use{" "}
						<ExternalLink href="https://www.markdownguide.org/basic-syntax/">
							markdown
						</ExternalLink>{" "}
						here!
					</Muted>
					<Divider className="mt-4 mb-4" />
				</>
			)}
			<ReactMarkdown>{content}</ReactMarkdown>
		</Card>
	);
}
