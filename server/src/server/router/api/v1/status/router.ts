import { Router } from "express";
import { FormatVersion } from "../../../../../lib/constants/version";

const router: Router = Router({ mergeParams: true });

router.get("/", (req, res) => {
    let echo;
    if (req.query.echo && typeof req.query.echo === "string") {
        echo = req.query.echo;
    }

    res.status(200).json({
        success: true,
        description: "Status check successful.",
        body: {
            serverTime: Date.now(),
            version: FormatVersion(),
            echo,
        },
    });
});

router.post("/", (req, res) => {
    let echo;
    if (req.body.echo && typeof req.body.echo === "string") {
        echo = req.body.echo;
    }

    res.status(200).json({
        success: true,
        description: "Status check successful.",
        body: {
            serverTime: Date.now(),
            version: FormatVersion(),
            echo,
        },
    });
});

export default router;
