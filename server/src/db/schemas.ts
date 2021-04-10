import Prudence, { PrudenceSchema } from "prudence";

// eslint-disable-next-line no-useless-escape
const LAZY_EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const PRUDENCE_PUBLIC_USER: PrudenceSchema = {
    username: Prudence.regex(/^[a-zA-Z_-][a-zA-Z0-9_-]{2,20}$/),
    usernameLowercase: (self, parent) => self === (parent!.username as string).toLowerCase(),
    password: "string", // could be a tighter fit related to bcrypt?
    email: Prudence.regex(LAZY_EMAIL_REGEX),
    id: Prudence.isPositiveInteger,
    settings: {
        nsfwsplashes: "boolean",
        invisible: "boolean",
        useSimpleLadderColours: "boolean",
    }
};
