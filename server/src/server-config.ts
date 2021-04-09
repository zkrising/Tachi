// we'll see how this works?
const supportedFileUploads = ["iidx:eamusement-csv", "iidx:plife-csv", "any:batchmanual-json"];

export default {
    PORT: process.env.PORT ?? 8080,
    supportedFileUploads,
};
