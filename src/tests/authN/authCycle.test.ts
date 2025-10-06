import test, { TestContext } from "node:test"

import { buildApp } from "@src/app.js";

import { equal, deepEqual } from "node:assert/strict"

import { execSync } from "child_process";

execSync(`npm run db:seed`, { stdio: "inherit" });

// import bcrypt from "bcrypt";

test("auth cycle test", async (t: TestContext) => {
  // SETUP
  const app = await buildApp();
  t.after(async () => {
    await app.close();
  });

  // create a user
  const postBody = {
    username: "admin",
    email: "admin@email.email",
    password: "12345678",
  };

  const loginResponse = await app.inject({
    method: "POST",
    url: "/login",
    payload: { username: postBody.username, password: postBody.password },
  });

  await t.test("User successfully logs in with correct credentials", () => {
    equal(loginResponse.json().message, "Logged in successfully!");
  });
  
  const getAllResponse = await app.inject({
    method: "GET",
    url: "/user",
    headers: {
      "access-token": loginResponse.json().data.accessToken,
    },
  });

  await t.test("Users can be accessed with correct token", () => {
    if (getAllResponse.json().message !== "Successfully retrieved all users!") {
      throw new Error("Users not retrieved, even with correct token");
    }
  });
  const getAllResponseNoToken = await app.inject({
    method: "GET",
    url: "/user",
    headers: {
      "access-token": "no token",
    },
  });

  await t.test("Not providing a token does not return users", () => {
    if (getAllResponseNoToken.json().message) {
      throw new Error("Able to get all users without an access token");
    }
  });
});
