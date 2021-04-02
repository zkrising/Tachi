import server from "../server";
import supertest from "supertest";

const mockServer = supertest(server);

// mock the server for requests
export default mockServer;
