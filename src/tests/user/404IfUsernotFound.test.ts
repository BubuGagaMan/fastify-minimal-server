import test, { TestContext } from "node:test";

import { buildApp } from "@src/app.js";

import { equal, deepEqual} from "node:assert/strict"

import userLogin from "../functions/userLogin.js";

import { execSync } from "child_process";

execSync(`npm run db:seed`, { stdio: "inherit" });

test("404IfUserNotFound.test.ts", async (t: TestContext) => {
  const app = await buildApp();
  t.after(async () => {
    await app.close();
  });

  const { loginResponse, loginResponseJSON } = await userLogin(
    app,
    "admin",
    "12345678"
  );
  const accessToken = (await loginResponseJSON).data.accessToken
  const unknownId = "51523fe5-1d84-4dd9-87ca-e8f41ebcf6f6"

  // @ TODO - make this into a function
  await t.test("404 when trying to get a user by an unknown id", async () => {
    const getUserByIdResponse = await app.inject({
      method: "GET",
      url: "/user/" + unknownId,
      headers: {
        "access-token": accessToken,
      },
    });

    const getUserByIdResponseJSON = await getUserByIdResponse.json();
    equal(getUserByIdResponse.statusCode, 404);
    equal(
      getUserByIdResponseJSON.message,
      "Failed to get user - user not found."
    );
  });

  /**
   * Updating a user is currently only possible by the user themselves
   * Therefore... it is not possible to run into an unknown users, as users can only edit themselves
   * So they have to exist, otherwise, will run into an unauthorised error before 404 erroring
   */

  await t.test("404 when trying to delete a user by an unknown id", async () => {
    const deleteUserByIdResponse = await app.inject({
      method: "DELETE",
      url: "/user/" + unknownId,
      headers: {
        "access-token": accessToken,
      },
    });

    const deleteUserByIdResponseJSON = await deleteUserByIdResponse.json();
    equal(deleteUserByIdResponse.statusCode, 404);
    equal(
      deleteUserByIdResponseJSON.message,
      "Failed to delete user - user not found."
    );
  });
});
