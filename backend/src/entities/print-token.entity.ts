import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PrintJob } from "./print-job.entity";
import { Kiosk } from "./kiosk.entity";

@Entity({ name: "print_tokens" })
export class PrintToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => PrintJob, (job) => job.tokens, { nullable: false })
  printJob!: PrintJob;

  @ManyToOne(() => Kiosk, { nullable: false })
  kiosk!: Kiosk;

  @Column({ type: "text", unique: true })
  token!: string;

  @Column({ type: "timestamptz" })
  expiresAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  consumedAt?: Date;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
