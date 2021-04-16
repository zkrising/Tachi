import { ImportTypes } from "kamaitachi-common";
import iidxEamusementCsv from "./csv-eamusement-iidx/converter";

/**
 * Converters are a set of functions designed to convert an element
 * from the iterable into the Kamaitachi Score Format.
 *
 * Due to some oddities with certain formats, one element may contain multiple possible
 * score records, so these functions MAY return an array of their traditional values.
 */
export const Converters = {
    "csv:eamusement-iidx": iidxEamusementCsv,
};

/**
 * Parsers are a set of functions designed to convert unparsed data
 * (files, request bodies, api responses) into an iterable.
 *
 * These functions should also perform validation on the "data" recieved,
 * such as whether they are valid JSON/csv files.
 *
 * However, they need not validate the actual data recieved - only that it is
 * parsable and sensible, but not whether the contents are semantically correct
 * (i.e. just parse the JSON into an array, and check if it can be done)
 * (don't check the content!)
 *
 * This is so we don't end up with dual-iteration over the set of data.
 */
export const Parsers = {};
