import { APIFetchV1 } from "util/api";
import React, { useContext } from "react";
import Button, { ButtonProps } from "react-bootstrap/Button";
import toast from "react-hot-toast";
import { UserContext } from "context/UserContext";
import Icon from "./Icon";

export default function SignOut({ variant = "outline-danger", ...props }: ButtonProps) {
	const { setUser } = useContext(UserContext);
	return (
		<Button
			variant={variant}
			onClick={async () => {
				if (confirm("Are you sure you want to sign out?")) {
					const rj = await APIFetchV1("/auth/logout", {
						method: "POST",
					});

					if (rj.success) {
						toast.success("Logged out.");
						setTimeout(() => {
							setUser(null);
							localStorage.removeItem("isLoggedIn");
							// This has to be the case.
							// Otherwise, react just ruins its own
							// state. I hate react state.
							window.location.href = "/";
						}, 500);
					}
				}
			}}
			{...props}
		>
			<Icon type="sign-out-alt" /> Sign Out
		</Button>
	);
}
