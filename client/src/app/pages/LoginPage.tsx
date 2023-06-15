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
import { UserDocument, UserSettingsDocument } from "tachi-common";
import { UserSettingsContext } from "context/UserSettingsContext";

export default function LoginPage() {
	const [err, setErr] = useState("");
	const { setUser } = useContext(UserContext);
	const { setSettings } = useContext(UserSettingsContext);
	const history = useHistory();

	const recaptchaRef = useRef<any>(null);

	const regex = /^[a-zA-Z_-][a-zA-Z0-9_-]{2,20}$/u;

	const formik = useFormik({
		initialValues: {
			username: "",
			"!password": "",
			captcha: "",
		},
		onSubmit: async (values) => {
			const token = process.env.VITE_RECAPTCHA_KEY
				? await recaptchaRef.current.executeAsync()
				: "";
			setErr("");

			if (!regex.test(values.username) || values["!password"].length < 8) {
				setErr("Invalid Username / Password");
			}

			const rj = await APIFetchV1("/auth/login", {
				method: "POST",
				body: JSON.stringify({
					username: values.username.trim(),
					"!password": values["!password"],
					captcha: token,
				}),
				headers: {
					"Content-Type": "application/json",
				},
			});

			toast.loading("Logging in", { id: "login-toast", className: "bg-dark text-body" });

			if (recaptchaRef.current) {
				recaptchaRef.current.reset();
			}

			if (!rj.success) {
				toast.dismiss("login-toast");
				setErr(HumaniseError(rj.description));
				return;
			}

			const userRJ = await APIFetchV1<UserDocument>("/users/me");

			if (userRJ.statusCode === 403) {
				toast.dismiss("login-toast");
				setErr("You are banned.");
				return;
			}

			if (!userRJ.success) {
				toast.dismiss("login-toast");
				console.error("Error retrieving own user?");
				setErr("An internal server error has occurred.");
				return;
			}

			toast.dismiss("login-toast");
			toast.success("Logged in!", { className: "bg-dark text-body" });

			const settingsRJ = await APIFetchV1<UserSettingsDocument>(`/users/me/settings`);

			setTimeout(() => {
				setUser(userRJ.body);
				localStorage.setItem("isLoggedIn", "true");
				if (settingsRJ.success) {
					setSettings(settingsRJ.body);
				} else {
					setSettings(null);
				}

				HistorySafeGoBack(history);
			}, 500);
		},
	});

	return (
		<CenterPage>
			<SiteWordmark />
			<h1 className="mb-4">Log In</h1>
			<Form
				className="w-100 px-4 mt-4"
				style={{ maxWidth: "480px" }}
				onSubmit={formik.handleSubmit}
			>
				<Form.Group className="mb-6">
					<Form.Label>Username</Form.Label>
					<Form.Control
						className="focus-ring"
						type="text"
						id="username"
						value={formik.values.username}
						onChange={formik.handleChange}
					/>
				</Form.Group>
				<Form.Group className="mb-6">
					<Form.Label>Password</Form.Label>
					<Form.Control
						className="focus-ring"
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
				<Form.Group className="d-flex flex-column">
					<Button type="submit" className="mt-2">
						Log In
					</Button>
					<div className="d-flex justify-content-between mt-2">
						<span className="text-body-secondary">
							Don't have an account?
							<Link to="/register" className="fw-bold ms-1 link-primary rounded">
								Sign Up!
							</Link>
						</span>
						<Link
							to="/forgot-password"
							className="fst-italic text-body-secondary text-hover-primary rounded"
						>
							Forgot Password?
						</Link>
					</div>
					<div className="my-6 d-flex justify-content-between">
						{process.env.VITE_RECAPTCHA_KEY && (
							<ReCAPTCHA
								theme="dark"
								size="invisible"
								ref={recaptchaRef}
								sitekey={process.env.VITE_RECAPTCHA_KEY}
								onChange={(v) => {
									formik.setFieldValue("captcha", v);
								}}
							/>
						)}
					</div>
					{/*process.env.VITE_MANDATE_LOGIN ? (
						<Button
							onClick={() => history.goBack()}
							tabIndex={0}
							variant="secondary"
							className="me-auto mt-4"
						>
							Back
						</Button>
					) : undefined*/}
				</Form.Group>
			</Form>
		</CenterPage>
	);
}
