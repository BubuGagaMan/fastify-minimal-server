import test from "node:test";

import userLogin from "@tests/functions/userLogin.js";

type TestContext = import("node:test").TestContext;
import { equal, deepEqual } from "node:assert/strict";
import { buildApp } from "@src/app.js";

import { execSync } from "child_process";

import user2 from "@db/fixtures/user/fixtures/user2.js";

execSync(`npm run db:seed`, { stdio: "inherit" });

test("userForbiddenUserActions.test.ts", async (t: TestContext) => {
  const app = await buildApp();
  t.after(async () => {
    await app.close();
  });

  const { loginResponse, loginResponseJSON } = await userLogin(
    app,
    "user1",
    "12345678"
  );

  const accessToken = (await loginResponseJSON).data.accessToken;

  await t.test(
    "Non-admin user cannot get all users",
    async (userForbiddenOpsTest: TestContext) => {
      const getAllResponse = await app.inject({
        method: "GET",
        url: "/user",
        headers: {
          "access-token": accessToken,
        },
      });
      const getAllResponseJSON = await getAllResponse.json();
      equal(getAllResponse.statusCode, 403);
      equal(
        getAllResponseJSON.error,
        "Failed to complete request - unauthorised"
      );
    }
  );
  await t.test(
    "Non-admin user cannot get one user",
    async (userForbiddenOpsTest: TestContext) => {
      const getByIdResponse = await app.inject({
        method: "GET",
        url: "/user/" + user2.id,
        headers: {
          "access-token": accessToken,
        },
      });

      equal(getByIdResponse.statusCode, 403);
      equal(
        getByIdResponse.json().error,
        "Failed to complete request - unauthorised"
      );
    }
  );
  await t.test(
    "Users cannot edit other users",
    async (userForbiddenOpsTest: TestContext) => {
      const getPutResponse = await app.inject({
        method: "PUT",
        url: "/user/" + user2.id,
        headers: {
          "access-token": accessToken,
        },
        body: {
          username: "new_username",
        },
      });
      equal(getPutResponse.statusCode, 403);
      equal(
        getPutResponse.json().error,
        "Failed to complete request - unauthorised"
      );
    }
  );
  await t.test(
    "Non-admin user cannot delete another user",
    async (userForbiddenOpsTest: TestContext) => {
      const getDeleteByIdResponse = await app.inject({
        method: "DELETE",
        url: "/user/" + user2.id,
        headers: {
          "access-token": accessToken,
        },
      });

      equal(getDeleteByIdResponse.statusCode, 403);
      equal(
        getDeleteByIdResponse.json().error,
        "Failed to complete request - unauthorised"
      );
    }
  );
});
