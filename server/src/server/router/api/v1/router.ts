import { Router } from "express";
import authRouter from "./auth/router";
import importRouter from "./import/router";
import irRouter from "../../ir/router";
import { FormatVersion } from "../../../../lib/constants/version";

const router: Router = Router({ mergeParams: true });

router.use("/auth", authRouter);
router.use("/import", importRouter);
router.use("/ir", irRouter);

router.use("/", (req, res) =>
    res.status(200).json({
        success: true,
        description: "Request recieved successfully.",
        body: {
            serverTime: Date.now(),
            version: FormatVersion(),
        },
    })
);
export default router;
