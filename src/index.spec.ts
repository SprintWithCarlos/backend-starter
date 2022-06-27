import { faker } from "@faker-js/faker";
import supertest, { SuperTest, Test } from "supertest";

import expressApp from "@/app";

describe("Test endpoints", () => {
  let token: string;
  let request: SuperTest<Test>;
  beforeAll(() => {
    request = supertest(expressApp.app);
  });
  beforeEach(() => {
    token = faker.datatype.uuid();
  });

  describe("Primary course", () => {
    it("should return 'Hello World' from GET /home", async () => {
      const result = await request.get("/home");
      expect(result.status).toBe(200);
      expect(result.text).toBe("Hello World");
    });
    it("should return json message from GET /json", async () => {
      const result = await request.get("/json");
      expect(result.text).toBe(JSON.stringify({ message: "OK" }));
    });
    it("should return body request from POST /get-request-body", async () => {
      const props = {
        name: `${faker.name.firstName} ${faker.name.lastName}`,
        email: faker.internet.email
      };
      const result = await request.post("/get-request-body").send(props);
      expect(result.status).toBe(200);
      expect(result.text).toBe(JSON.stringify({ body: { name: props.name, email: props.email } }));
    });
    it("should return token from POST /get-auth", async () => {
      const result = await request.post("/get-auth").set("Authorization", `Bearer ${token}`);
      expect(result.status).toBe(200);
      expect(result.text).toBe(JSON.stringify({ token }));
    });
  });
  describe("Exception course", () => {
    it("should return 404 for unknown endpoint", async () => {
      const result = await request.get("/unknown");
      expect(result.status).toBe(404);
    });
    it("should return 401 if no header is set from POST /get-auth", async () => {
      const result = await request.post("/get-auth");
      expect(result.status).toBe(401);
      expect(result.text).toBe(JSON.stringify({ error: "You are not authenticated" }));
    });
    it("should return 401 if no token from POST /get-auth", async () => {
      const result = await request.post("/get-auth").set("Authorization", "Bearer");
      expect(result.status).toBe(401);
      expect(result.text).toBe(JSON.stringify({ error: "You are not authenticated" }));
    });
  });
});
