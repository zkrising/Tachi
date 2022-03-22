import { APIFetchV1 } from "util/api";
import { ShortDelayify } from "util/misc";
import CenterPage from "components/util/CenterPage";
import MainPageTitleContainer from "components/util/MainPageTitleContainer";
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { ErrorPage } from "./ErrorPage";

export default function ResetPasswordPage() {
	const code = new URLSearchParams(window.location.search).get("code");
	const [password, setPassword] = useState("");
	const [confirmPass, setConfirmPass] = useState("");

	if (!code) {
		return <ErrorPage statusCode={400} />;
	}

	return (
		<CenterPage>
			<MainPageTitleContainer
				title="Reset Password"
				desc="Pick something you'll remember this time :)"
			/>
			<Form
				onSubmit={async e => {
					e.preventDefault();

					const res = await APIFetchV1(
						"/auth/reset-password",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ code, "!password": password }),
						},
						true,
						true
					);

					if (res.success) {
						ShortDelayify(() => (window.location.href = "/"));
					}
				}}
			>
				<Form.Group>
					<Form.Label>New Password</Form.Label>
					<Form.Control
						value={password}
						onChange={e => setPassword(e.target.value)}
						isValid={password.length >= 8}
						type="password"
					/>
				</Form.Group>
				<Form.Group>
					<Form.Label>Confirm</Form.Label>
					<Form.Control
						value={confirmPass}
						onChange={e => setConfirmPass(e.target.value)}
						isValid={password === confirmPass}
						type="password"
					/>
				</Form.Group>
				<Form.Group className="justify-content-center d-flex pt-4">
					<Button
						tabIndex={3}
						type="submit"
						className="ml-auto"
						disabled={!(password === confirmPass && password.length >= 8)}
					>
						Reset Password
					</Button>
				</Form.Group>
			</Form>
		</CenterPage>
	);
}
