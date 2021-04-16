import supertest from "supertest";

import api from "../internal-api/internal-api";

const mockApi = supertest(api);

export default mockApi;
