import test from "node:test";
import { buildApp } from "@src/app.js";
import userLogin from "@tests/functions/userLogin.js";
import getTokenPayload from "@tests/functions/getTokenPayload.js";
import { TestContext } from "node:test";
import { execSync } from "child_process";
import { equal } from "node:assert/strict";
import isPasswordCorrect from "@tests/functions/isPasswordCorrect.js";

execSync(`npm run db:seed`, { stdio: "inherit" });

test("createUser.test.ts", async (t: TestContext) => {
  const app = await buildApp();
  t.after(async () => {
    await app.close();
  });

  const newUserData = {
    email: "newUser@email.email",
    username: "newUser",
    password: "12345678",
  };

  await t.test("Non-existing (yet) new user fails login initially.", async () => {
    const { loginResponse, loginResponseJSON } = await userLogin(app, newUserData.username, newUserData.password);
    equal(loginResponse.statusCode, 404);
    equal((await loginResponseJSON).message, `User with username ${newUserData.username} not found`);
  });

  await t.test(
    "Cannot create a user without passing all props, which should also agree with the requirements",
    async (createUserT: TestContext) => {
      await createUserT.test("Cannot create a user without passing an email", async () => {
        const createUserRes = await app.inject({
          method: "POST",
          url: "/user",
          body: {
            username: newUserData.username,
            password: newUserData.password,
          },
        });
        const createUserResJSON = await createUserRes.json();
        equal(createUserRes.statusCode, 400);
        equal(createUserResJSON.error, "body must have required property 'email'");
      });

      await createUserT.test("Cannot create a user without passing a username", async () => {
        const createUserRes = await app.inject({
          method: "POST",
          url: "/user",
          body: {
            email: newUserData.email,
            password: newUserData.password,
          },
        });
        const createUserResJSON = await createUserRes.json();
        equal(createUserRes.statusCode, 400);
        equal(createUserResJSON.error, "body must have required property 'username'");
      });

      await createUserT.test("Cannot create a user without passing a password", async () => {
        const createUserRes = await app.inject({
          method: "POST",
          url: "/user",
          body: {
            username: newUserData.username,
            email: newUserData.email,
          },
        });
        const createUserResJSON = await createUserRes.json();
        equal(createUserRes.statusCode, 400);
        equal(createUserResJSON.error, "body must have required property 'password'");
      });

      await createUserT.test("Cannot create a user with a password with less than 8 chars", async () => {
        const createUserRes = await app.inject({
          method: "POST",
          url: "/user",
          body: {
            username: newUserData.username,
            email: newUserData.email,
            password: "1234567",
          },
        });
        const createUserResJSON = await createUserRes.json();
        equal(createUserRes.statusCode, 400);
        equal(createUserResJSON.error, "body/password must NOT have fewer than 8 characters");
      });

      await createUserT.test("Cannot create a user with an email lacking the email format", async () => {
        const createUserRes = await app.inject({
          method: "POST",
          url: "/user",
          body: {
            username: newUserData.username,
            email: "randomStringNoFormat",
            password: newUserData.password,
          },
        });
        const createUserResJSON = await createUserRes.json();
        equal(createUserRes.statusCode, 400);
        equal(createUserResJSON.error, 'body/email must match format "email"');
      });

      await createUserT.test("Cannot create a user with a username exceeding 24 chars", async () => {
        const createUserRes = await app.inject({
          method: "POST",
          url: "/user",
          body: {
            username: "abcdefghijklmnopqrstuvwxy",
            email: newUserData.email,
            password: newUserData.password,
          },
        });
        const createUserResJSON = await createUserRes.json();
        equal(createUserRes.statusCode, 400);
        equal(createUserResJSON.error, "body/username must NOT have more than 24 characters");
      });

      await createUserT.test("Cannot create a user with a username with less than 6 chars", async () => {
        const createUserRes = await app.inject({
          method: "POST",
          url: "/user",
          body: {
            username: "abcde",
            email: newUserData.email,
            password: newUserData.password,
          },
        });
        const createUserResJSON = await createUserRes.json();
        equal(createUserRes.statusCode, 400);
        equal(createUserResJSON.error, "body/username must NOT have fewer than 6 characters");
      });
    }
  );

  await t.test("Creating a new user with all props returns a successful response.", async () => {
    const createUserRes = await app.inject({
      method: "POST",
      url: "/user",
      body: newUserData,
    });
    const createUserResJSON = await createUserRes.json();

    equal(createUserRes.statusCode, 201);
    equal(createUserResJSON.message, "User created successfully!");
    equal(createUserResJSON.data.savedUser.admin, false);
    equal(createUserResJSON.data.savedUser.user.username, newUserData.username);
    equal(createUserResJSON.data.savedUser.user.email, newUserData.email);
    isPasswordCorrect(newUserData.password, createUserResJSON.data.savedUser.user.password);
  });

  await t.test("New user can login successfully after creation.", async () => {
    const { loginResponse, loginResponseJSON } = await userLogin(app, newUserData.username, newUserData.password);
    equal(loginResponse.statusCode, 200);
    equal((await loginResponseJSON).message, "Logged in successfully!");
  });
});
