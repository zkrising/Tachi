import Pr, { PrudenceSchema } from "prudence";

// eslint-disable-next-line no-useless-escape
const LAZY_EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const PRUDENCE_PUBLIC_USER: PrudenceSchema = {
    _id: Pr.any,
    username: Pr.regex(/^[a-zA-Z_-][a-zA-Z0-9_-]{2,20}$/),
    usernameLowercase: (self, parent) => self === (parent!.username as string).toLowerCase(),
    id: Pr.isPositiveInteger,
    settings: {
        nsfwSplashes: "boolean",
        invisible: "boolean",
    },
    friends: [Pr.isPositiveInteger],
    socialMedia: {
        discord: "*string",
        twitter: "*string",
        github: "*string",
        steam: "*string",
        youtube: "*string",
        twitch: "*string",
    },
    about: Pr.isBoundedString(0, 4000),
    customPfp: "boolean",
    customBanner: "boolean",
    permissions: {
        admin: "*boolean",
    },
    clan: Pr.nullable(Pr.isBoundedString(1, 4)),
    lastSeen: Pr.nullable(Pr.isPositiveInteger),
};

export const PRUDENCE_PRIVATE_USER = Object.assign(
    {
        password: "string", // could be a tighter fit related to bcrypt?
        email: Pr.regex(LAZY_EMAIL_REGEX),
    },
    PRUDENCE_PUBLIC_USER
);
