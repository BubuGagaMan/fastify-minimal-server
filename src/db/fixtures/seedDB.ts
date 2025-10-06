import addUserWithRole from "./user/addUserWithRole.js";
import { buildApp } from "@src/app.js";
import AppDataSource from "../data-source.js";
// import user1 = require("./user/fixtures/user1.js");
// import user2 = require("./user/fixtures/user2.js");
// import user3 = require("./user/fixtures/user3.js");
// import user4 = require("./user/fixtures/user4.js");
// import admin = require("./user/fixtures/admin.js");
import user1 from "./user/fixtures/user1.js";
import user2 from "./user/fixtures/user2.js";
import user3 from "./user/fixtures/user3.js";
import user4 from "./user/fixtures/user4.js";
import admin from "./user/fixtures/admin.js";

async function seedDB() {
  const app = await buildApp();
  console.log("Clearing Database:");

  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();

  await queryRunner.query(
    'TRUNCATE TABLE "role", "user" RESTART IDENTITY CASCADE'
  );

  console.log("DB cleared!");

  console.log("Adding entries:");

  await addUserWithRole(user1, queryRunner.manager);
  await addUserWithRole(user2, queryRunner.manager);
  await addUserWithRole(user3, queryRunner.manager);
  await addUserWithRole(user4, queryRunner.manager);
  await addUserWithRole(admin, queryRunner.manager);

  await queryRunner.release();
  await app.close();
}

await seedDB().then(() => {
  console.log("Database seed complete");
});

export default seedDB;
