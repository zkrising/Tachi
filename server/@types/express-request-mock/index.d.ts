declare module "express-request-mock" {
    import { Request, Response, RequestHandler } from "express";
    export default function (
        r: RequestHandler,
        options: Partial<Request>
    ): Promise<{ req: Request; res: Response }>;
}
