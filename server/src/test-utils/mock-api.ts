import supertest from "supertest";

import server from "../server";

const connection = server.listen(8079);

const mockApi = supertest(connection);

export function CloseServerConnection() {
    connection.close();
}

export default mockApi;
