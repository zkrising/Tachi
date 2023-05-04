import { APIFetchV1 } from "util/api";
import { HistorySafeGoBack } from "util/misc";
import CenterPage from "components/util/CenterPage";
import SiteWordmark from "components/util/SiteWordmark";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const history = useHistory();
	const [hasResetPassword, setHasResetPassword] = useState(false);

	return (
		<CenterPage>
			<SiteWordmark />
			<h3>Forgot Password</h3>
			<span className="fw-bold">Hey, it happens to all of us :P</span>
			{hasResetPassword ? (
				<div>
					All good! An email has been sent to {email} IF an account exists with that
					email.
					<br />
					<Link to="/">Go home.</Link>
				</div>
			) : (
				<>
					<Form
						className="w-100 px-4 mt-8"
						style={{ maxWidth: "620px" }}
						onSubmit={async (e) => {
							e.preventDefault();

							const res = await APIFetchV1(
								"/auth/forgot-password",
								{
									method: "POST",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({ email }),
								},
								true,
								true
							);

							if (res.success) {
								setTimeout(() => setHasResetPassword(true), 300);
							}
						}}
					>
						<Form.Group className="mb-6">
							<Form.Label>Email Address</Form.Label>
							<Form.Control
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</Form.Group>
						<Form.Group className="justify-content-center d-flex mb-6">
							<span
								onClick={() => HistorySafeGoBack(history)}
								tabIndex={4}
								className="me-auto btn btn-outline-danger"
							>
								Back
							</span>
							<Button
								tabIndex={3}
								type="submit"
								className="ms-auto"
								disabled={email === ""}
							>
								Send Reset Link
							</Button>
						</Form.Group>
					</Form>
					<Link to="/screwed">
						I signed up with a fake email, how can I recover my account?
					</Link>
				</>
			)}
		</CenterPage>
	);
}
