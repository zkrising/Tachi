import { Router } from "express";
import prValidate from "../../../middleware/prudence-validate";
import chartsRouter from "./charts/router";
import coursesRouter from "./courses/router";

const router: Router = Router({ mergeParams: true });

router.post(
    "/auth/login",
    prValidate({
        username: "string",
        password: "string",
    }),
    async (req, res) => {}
);

router.use("/charts/:chartSHA256", chartsRouter);
router.use("/courses/:courseSHA256", coursesRouter);

export default router;
