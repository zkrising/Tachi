import monk from "monk";

export const oldKTDB = monk("127.0.0.1:27017/kamaitachidb");
