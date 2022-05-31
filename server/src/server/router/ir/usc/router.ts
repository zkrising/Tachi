import uscirRouter from "./_playtype/router";
import { Router } from "express";

const router: Router = Router({ mergeParams: true });

router.use("/:playtype", uscirRouter);

export default router;
