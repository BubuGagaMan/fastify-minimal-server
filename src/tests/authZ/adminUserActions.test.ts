import test from "node:test"
type TestContext = import("node:test").TestContext;
import { equal, deepEqual } from "node:assert/strict"

import { buildApp } from "@src/app.js";

import { execSync } from "child_process";

execSync(`npm run db:seed`, { stdio: "inherit" });

test("adminUserActions.test.ts", async (t: TestContext) => {
  const app = await buildApp();
  t.after(async () => {
    await app.close();
  });

  await t.test(
    "Admin operations are successful with full access",
    async (adminOpsTest: TestContext) => {
      const adminCredentials = {
        username: "admin",
        password: "12345678",
      };

      // admin login
      const loginResponse = await app.inject({
        method: "POST",
        url: "/login",
        payload: {
          username: adminCredentials.username,
          password: adminCredentials.password,
        },
      });

      const loginResponseJSON = await loginResponse.json();
      let user1: any;

      await adminOpsTest.test(
        "Admin can successfully get all users",
        async () => {
          const getAllResponse = await app.inject({
            method: "GET",
            url: "/user",
            headers: {
              "access-token": loginResponseJSON.data.accessToken,
            },
          });
          const getAllResponseJSON = await getAllResponse.json();
          console.log(getAllResponseJSON)
          user1 = getAllResponseJSON.data.users[0];
          console.log(user1)
          equal(getAllResponse.statusCode, 200);
          equal(
            getAllResponseJSON.message,
            "Successfully retrieved all users!"
          );
        }
      );

      await adminOpsTest.test("Admin can successfully get a user by id", async () => {
        const getByIdResponse = await app.inject({
          method: "GET",
          url: "/user/" + user1.id,
          headers: {
            "access-token": loginResponseJSON.data.accessToken,
          },
        });

        const getByIdResponseJSON = getByIdResponse.json();
        equal(getByIdResponse.statusCode, 200);
        equal(
          getByIdResponseJSON.message,
          `User successfully retrieved!`
        );
        console.log(user1)
        deepEqual(getByIdResponseJSON.data, { user: user1 });
      });

      await adminOpsTest.test(
        "Admin can successfully delete a user by id",
        async () => {
          const getDeleteByIdResponse = await app.inject({
            method: "DELETE",
            url: "/user/" + user1.id,
            headers: {
              "access-token": loginResponseJSON.data.accessToken,
            },
          });

          equal(getDeleteByIdResponse.statusCode, 204);

          // getting the deleted user by id should return 404
          const getByIdResponse = await app.inject({
            method: "GET",
            url: "/user/" + user1.id,
            headers: {
              "access-token": loginResponseJSON.data.accessToken,
            },
          });

          const getByIdResponseJSON = getByIdResponse.json();

          equal(getByIdResponse.statusCode, 404);
          equal(
            getByIdResponseJSON.message,
            "Failed to get user - user not found."
          );
        }
      );
    }
  );
});
