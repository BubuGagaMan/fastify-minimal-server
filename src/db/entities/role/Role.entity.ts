import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Relation
} from "typeorm";
import type { User } from "../user/User.entity.js";

@Entity()
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false })
  admin!: boolean;

  @OneToOne("User", "role", {
    cascade: ["insert"],
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;

  constructor(user: User) {
    this.user = user;
  }
}
