import { APIFetchV1 } from "util/api";
import { HumaniseError } from "util/humanise-error";
import { HistorySafeGoBack } from "util/misc";
import CenterPage from "components/util/CenterPage";
import SiteWordmark from "components/util/SiteWordmark";
import { UserContext } from "context/UserContext";
import { useFormik } from "formik";
import React, { useContext, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import { Link, useHistory } from "react-router-dom";
import { UserDocument } from "tachi-common";

export default function LoginPage() {
	const [err, setErr] = useState("");
	const { setUser } = useContext(UserContext);
	const history = useHistory();

	const recaptchaRef = useRef<any>(null);

	const formik = useFormik({
		initialValues: {
			username: "",
			"!password": "",
			captcha: "",
		},
		onSubmit: async (values) => {
			setErr("");

			const rj = await APIFetchV1(
				"/auth/login",
				{
					method: "POST",
					body: JSON.stringify({
						username: values.username.trim(),
						"!password": values["!password"],
						captcha: values.captcha,
					}),
					headers: {
						"Content-Type": "application/json",
					},
				},
				false,
				false
			);

			if (recaptchaRef.current) {
				recaptchaRef.current.reset();
			}

			if (!rj.success) {
				setErr(HumaniseError(rj.description));
				return;
			}

			const userRJ = await APIFetchV1<UserDocument>("/users/me");

			if (userRJ.statusCode === 403) {
				setErr("You are banned.");
				return;
			}

			if (!userRJ.success) {
				console.error("Error retrieving own user?");
				setErr("An internal server error has occurred.");
				return;
			}

			toast.success("Logged in!");

			setTimeout(() => {
				setUser(userRJ.body);
				localStorage.setItem("isLoggedIn", "true");

				HistorySafeGoBack(history);
			}, 500);
		},
	});

	return (
		<CenterPage>
			<SiteWordmark />
			<div className="text-center mb-8">
				<h1>Log In</h1>
				<span className="fw-bold text-muted">Don't have an account?</span>
				<Link to="/register" className="fw-bold ms-1">
					Sign Up!
				</Link>
			</div>
			<Form
				className="w-100 px-4 mt-8"
				style={{ maxWidth: "620px" }}
				onSubmit={formik.handleSubmit}
			>
				<Form.Group className="mb-6">
					<Form.Label>Username</Form.Label>
					<Form.Control
						tabIndex={1}
						type="text"
						id="username"
						value={formik.values.username}
						onChange={formik.handleChange}
					/>
				</Form.Group>
				<Form.Group className="mb-6">
					<Form.Label>Password</Form.Label>
					<Form.Control
						tabIndex={2}
						type="password"
						id="!password"
						value={formik.values["!password"]}
						onChange={formik.handleChange}
					/>
				</Form.Group>
				<Form.Group
					style={{ display: err ? "" : "none" }}
					className="text-center text-danger mb-6"
				>
					{err}
				</Form.Group>
				<div className="my-6">
					{process.env.VITE_RECAPTCHA_KEY && (
						<ReCAPTCHA
							ref={recaptchaRef}
							sitekey={process.env.VITE_RECAPTCHA_KEY}
							onChange={(v) => {
								formik.setFieldValue("captcha", v);
							}}
						/>
					)}
				</div>
				<Form.Group className="justify-content-center d-flex">
					<span
						onClick={() => history.goBack()}
						tabIndex={4}
						className="me-auto btn btn-outline-danger"
					>
						Back
					</span>
					<Link to="/forgot-password">Forgot Password</Link>
					<Button tabIndex={3} type="submit" className="ms-auto">
						Log In
					</Button>
				</Form.Group>
			</Form>
		</CenterPage>
	);
}
