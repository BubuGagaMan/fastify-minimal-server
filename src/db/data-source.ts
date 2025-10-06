import "reflect-metadata";
import { DataSource } from "typeorm";
import { Role } from "./entities/role/Role.entity.js";
import { User } from "./entities/user/User.entity.js";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "user1",
  password: process.env.DB_PASSWORD || "12345",
  database: process.env.DB_NAME || "db1",
  synchronize: false, // use migrations instead!
  logging: true,
  entities: [
    // "./dist/db//entities/**/*.entity.js"
    Role,
    User,
  ],

  migrations: ["./dist/db//migrations/**/*.js"],
});

export default AppDataSource
