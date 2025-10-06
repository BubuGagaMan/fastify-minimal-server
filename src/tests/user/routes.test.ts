import { describe, test } from "node:test";
import { equal, deepEqual } from "node:assert/strict";
import { buildApp } from "../../app.js";
// import { QueryBuilder } from "typeorm";
// import { DataSource } from "typeorm";
import AppDataSource from "../../db/data-source.js";
import bcrypt from "bcrypt";

test("user controller test", async (t) => {
  // SETUP
  const app = await buildApp();
  t.after(async () => {
    await app.close();
  });

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  await queryRunner.query(`DROP TABLE "user"`);
  await queryRunner.query(
    `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
  );

  await queryRunner.release();

  // TEST CREATING USER

  const postBody = {
    username: "user1",
    email: "user1@email.email",
    password: "12345678",
  };

  const postRes = await app.inject({
    method: "POST",
    url: "/user",
    payload: postBody,
  });

  equal(postRes.statusCode, 201);
  equal(postRes.headers["content-type"], "application/json; charset=utf-8");

  const postResJson = postRes.json();

  equal(postResJson.message, "User created successfully!");
  equal(postResJson.data.user.username, "user1");
  equal(postResJson.data.user.email, "user1@email.email");

  const passwordCorrectlyHashed = await bcrypt.compare(
    postBody.password,
    postResJson.data.user.password
  );
  equal(passwordCorrectlyHashed, true);

  // TEST PUT ON USER

  const putBody = {
    username: "user2",
    email: "user2@email.email",
    password: "123456789",
  };

  const putRes = await app.inject({
    method: "PUT",
    url: "/user/" + postResJson.data.user.id,
    payload: putBody,
  });

  equal(putRes.statusCode, 200);
  equal(putRes.headers["content-type"], "application/json; charset=utf-8");

  const putResJson = putRes.json();

  equal(
    putResJson.message,
    `Successfully updated user (id: ${postResJson.data.user.id})!`
  );
  equal(putResJson.data.user.username, "user2");
  equal(putResJson.data.user.email, "user2@email.email");

  const putPasswordCorrectlyHashed = await bcrypt.compare(
    putBody.password,
    putResJson.data.user.password
  );

  equal(putPasswordCorrectlyHashed, true);
  // id remains unchanged
  equal(putResJson.id, postResJson.id);

  // TEST GET_ONE AND GET_ALL

  // GET ALL
  const getAllRes = await app.inject({
    method: "GET",
    url: "/user",
  });

  equal(getAllRes.statusCode, 200);
  equal(getAllRes.headers["content-type"], "application/json; charset=utf-8");
  deepEqual(getAllRes.json(), {
    message: "Successfully retrieved all users!",
    data: {
      users: [putResJson.data.user],
    },
  });

  // GET ONE
  const getOneRes = await app.inject({
    method: "GET",
    url: "/user/" + putResJson.data.user.id,
  });

  equal(getOneRes.statusCode, 200);
  equal(getOneRes.headers["content-type"], "application/json; charset=utf-8");
  deepEqual(getOneRes.json(), {
    message: `User (id: ${putResJson.data.user.id}) successfully retrieved.`,
    data: {
      user: putResJson.data.user,
    },
  });

  // DELETE TEST

  const deleteRes = await app.inject({
    method: "DELETE",
    url: "/user/" + putResJson.data.user.id,
  });

  equal(deleteRes.statusCode, 204);
  //   equal(deleteRes.headers["content-type"], "application/json; charset=utf-8");

  //   deepEqual(deleteRes.json(), {
  //     message: `User (id ${putResJson.data.user.id}}) successfully deleted.`,
  //   });

  // TEST GET_ONE AND GET_ALL AFTER DELETION

  // GET ALL
  const getAllEmptyRes = await app.inject({
    method: "GET",
    url: "/user",
  });

  equal(getAllEmptyRes.statusCode, 200);
  equal(
    getAllEmptyRes.headers["content-type"],
    "application/json; charset=utf-8"
  );
  deepEqual(getAllEmptyRes.json(), {
    message: "Successfully retrieved all users!",
    data: {
      users: [],
    },
  });

  // GET ONE
  const getOneEmptyRes = await app.inject({
    method: "GET",
    url: "/user/" + putResJson.data.user.id,
  });

  equal(getOneEmptyRes.statusCode, 404);
  equal(
    getOneEmptyRes.headers["content-type"],
    "application/json; charset=utf-8"
  );
  deepEqual(getOneEmptyRes.json(), {
    message: "Failed to find user - user not found.",
  });
});
