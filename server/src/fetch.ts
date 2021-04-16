import nodeFetch from "node-fetch";

const fetch =
    process.env.NODE_ENV === "test"
        ? () => {
              throw new Error("Cannot use real fetch inside testing env!");
          }
        : nodeFetch;

export default (fetch as unknown) as typeof nodeFetch;
