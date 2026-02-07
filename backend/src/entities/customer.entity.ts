import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PrintJob } from "./print-job.entity";
import { OtpSession } from "./otp-session.entity";

@Entity({ name: "customers" })
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text", unique: true })
  mobileNumber!: string;

  @Column({ type: "boolean", default: false })
  isVerified!: boolean;

  @Column({ type: "timestamptz", nullable: true })
  verifiedAt?: Date;

  @OneToMany(() => PrintJob, (job) => job.customer)
  printJobs!: PrintJob[];

  @OneToMany(() => OtpSession, (session) => session.customer)
  otpSessions!: OtpSession[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
