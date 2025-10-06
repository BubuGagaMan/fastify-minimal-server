import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  Relation,
} from "typeorm";

import type { Role } from "../role/Role.entity.js";
import type { UserMetrics } from "../user_metrics/UserMetrics.entity.js";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    unique: true,
  })
  username!: string;

  @Column({
    unique: true,
  })
  email!: string;

  @Column()
  password!: string;

  @OneToOne("Role", "user", {})
  role!: Relation<Role>;

  @OneToOne("UserMetrics", "user", {})
  userMetrics!: Relation<UserMetrics>
}
