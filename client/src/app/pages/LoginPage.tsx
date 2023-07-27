import { APIFetchV1 } from "util/api";
import { HumaniseError } from "util/humanise-error";
import { HistorySafeGoBack } from "util/misc";
import useSetSubheader from "components/layout/header/useSetSubheader";
import { UserContext } from "context/UserContext";
import { useFormik } from "formik";
import React, { useContext, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import { Link, useHistory } from "react-router-dom";
import { UserDocument } from "tachi-common";
import LoginPageLayout from "components/layout/LoginPageLayout";

export default function LoginPage() {
	useSetSubheader("Login");

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
		<LoginPageLayout heading="Log In" description={<Description />}>
			<Form onSubmit={formik.handleSubmit} className="d-flex flex-column gap-4 w-100">
				<Form.Group>
					<Form.Label>Username</Form.Label>
					<Form.Control
						tabIndex={1}
						type="text"
						id="username"
						value={formik.values.username}
						onChange={formik.handleChange}
					/>
				</Form.Group>
				<Form.Group>
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
					className="text-center text-danger"
				>
					{err}
				</Form.Group>

				{process.env.VITE_RECAPTCHA_KEY && (
					<ReCAPTCHA
						ref={recaptchaRef}
						sitekey={process.env.VITE_RECAPTCHA_KEY}
						onChange={(v) => {
							formik.setFieldValue("captcha", v);
						}}
					/>
				)}

				<Form.Group className="justify-content-center d-flex pt-4">
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
		</LoginPageLayout>
	);
}

const Description = () => (
	<>
		Don't have an account?
		<Link to="/register" className="fw-bold ms-2 link-primary">
			Sign Up!
		</Link>
	</>
);
