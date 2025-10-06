import test from "node:test";
import isPasswordCorrect from "../functions/isPasswordCorrect.js";
type TestContext = import("node:test").TestContext;
type FastifyInstance = import("fastify").FastifyInstance;
import { equal, deepEqual } from "node:assert/strict";

import { buildApp } from "@src/app.js";

import user1 from "@db/fixtures/user/fixtures/user1.js";

import { execSync } from "child_process";

execSync(`npm run db:seed`, { stdio: "inherit" });

const userNotFoundOnLogin = async (app: FastifyInstance, username: string, password: string) => {
  const loginResponsePostDeletion = await app.inject({
    method: "POST",
    url: "/login",
    payload: {
      username: username,
      password: password,
    },
  });
  equal(loginResponsePostDeletion.statusCode, 404);
  equal(loginResponsePostDeletion.json().message, `User with username ${username} not found`);
};

const userLoginResponse = async (app: FastifyInstance, username: string, password: string) => {
  const loginResponse = await app.inject({
    method: "POST",
    url: "/login",
    payload: {
      username: username,
      password: password,
    },
  });

  return loginResponse;
};

test("userSelfUserActions.test", async (t: TestContext) => {
  const app: FastifyInstance = await buildApp();
  t.after(async () => {
    await app.close();
  });

  await t.test("User can perform authentication restricted actions on self", async (userOpsTest: TestContext) => {
    let user1Credentials = {
      username: "user1",
      password: "12345678",
    };

    // user1 login
    const loginResponse = await userLoginResponse(app, user1Credentials.username, user1Credentials.password);

    const loginResponseJSON = await loginResponse.json();
    // @TODO - should use the get token function here
    type UserTokenPayload = {
      id: string;
      username: string;
      iat: number;
      exp: number;
    } | null;

    let userTokenPayload: UserTokenPayload = await app.jwt.decode(loginResponseJSON.data.accessToken);

    if (userTokenPayload) {
      await userOpsTest.test("User can get self", async () => {
        const getByIdResponse = await app.inject({
          method: "GET",
          url: "/user/" + userTokenPayload?.id,
          headers: {
            "access-token": loginResponseJSON.data.accessToken,
          },
        });

        const getByIdResponseJSON = getByIdResponse.json();
        equal(getByIdResponse.statusCode, 200);
        equal(getByIdResponseJSON.message, `User successfully retrieved!`);
        equal(getByIdResponseJSON.data.user.id, user1.id);
        equal(getByIdResponseJSON.data.user.username, user1.username);
        equal(getByIdResponseJSON.data.user.email, user1.email);
        isPasswordCorrect(user1.password, getByIdResponseJSON.data.user.password);
      });

      await userOpsTest.test("User all edit self tests", async (userEditSelfAllTests) => {
        await userEditSelfAllTests.test(
          "User cannot edit self with incorrect props",
          async (editSelfIncorrectPropsTest) => {
            type IncorrectProp = "password" | "username" | "email";

            const testForIncorrectProp = async (
              incorrectProp: IncorrectProp,
              incorrectPropValue: string,
              responseError: string,
              testName: string
            ) => {
              await editSelfIncorrectPropsTest.test(testName, async () => {
                const getUpdateByIdResponse = await app.inject({
                  method: "PUT",
                  url: "/user/" + userTokenPayload?.id,
                  headers: {
                    "access-token": loginResponseJSON.data.accessToken,
                  },
                  body: {
                    [incorrectProp]: incorrectPropValue,
                  },
                });

                const getUpdateByIdResponseJSON = await getUpdateByIdResponse.json();
                equal(getUpdateByIdResponse.statusCode, 400);
                equal(getUpdateByIdResponseJSON.error, responseError);
              });
            };

            await testForIncorrectProp(
              "email",
              "emailNoFormat",
              'body/email must match format "email"',
              "Can't change to an email with no email format"
            );
            await testForIncorrectProp(
              "password",
              "1234567",
              "body/password must NOT have fewer than 8 characters",
              "can't change to a password with < 8 chars"
            );
            await testForIncorrectProp(
              "username",
              "abcdefghijklmnopqrstuvwxy",
              "body/username must NOT have more than 24 characters",
              "Can't change username to one with > 24 chars"
            );
            await testForIncorrectProp(
              "username",
              "abcde",
              "body/username must NOT have fewer than 6 characters",
              "Can't change username to one with < 6 chars"
            );
          }
        );

        await userEditSelfAllTests.test(
          "User can edit/update self, when using correct props",
          async (userEditSelfTest) => {
            const updatedDataBody = {
              username: "user1NewName",
              password: "user1NewPassword",
              email: "user1NewEmail@email.email",
            };
            const getUpdateByIdResponse = await app.inject({
              method: "PUT",
              url: "/user/" + userTokenPayload?.id,
              headers: {
                "access-token": loginResponseJSON.data.accessToken,
              },
              body: updatedDataBody,
            });

            const getUpdateByIdResponseJSON = getUpdateByIdResponse.json();

            await userEditSelfTest.test("User edit response is successful and correct", async () => {
              equal(getUpdateByIdResponse.statusCode, 200);
              equal(getUpdateByIdResponseJSON.message, `Successfully updated user!`);
              equal(getUpdateByIdResponseJSON.data.user.email, updatedDataBody.email);
              equal(getUpdateByIdResponseJSON.data.user.username, updatedDataBody.username);
              const passwordCheck = await isPasswordCorrect(
                updatedDataBody.password,
                getUpdateByIdResponseJSON.data.user.password
              );

              equal(passwordCheck, true);
            });

            await userEditSelfTest.test("User fails to login with old credentials", async () => {
              await userNotFoundOnLogin(app, user1Credentials.username, user1Credentials.password);

              // update credentials for potential later tests
              user1Credentials.username = updatedDataBody.username;
              user1Credentials.password = updatedDataBody.password;
            });

            await userEditSelfTest.test("User can login with new credentials", async () => {
              const newCredentialsLoginResponse = await userLoginResponse(
                app,
                user1Credentials.username,
                user1Credentials.password
              );

              equal(newCredentialsLoginResponse.statusCode, 200);
              equal(newCredentialsLoginResponse.json().message, "Logged in successfully!");

              // update the token for potential later tests
              userTokenPayload = await app.jwt.decode(newCredentialsLoginResponse.json().data.accessToken);
            });
          }
        );
      });

      await userOpsTest.test("User can delete self", async () => {
        const getDeleteByIdResponse = await app.inject({
          method: "DELETE",
          url: "/user/" + userTokenPayload?.id,
          headers: {
            "access-token": loginResponseJSON.data.accessToken,
          },
        });

        equal(getDeleteByIdResponse.statusCode, 204);
      });
    } else {
      throw new Error("JWT token didn't decode successfully");
    }
  });
});
