import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Customer } from "./customer.entity";
import { FileAsset } from "./file.entity";
import { Kiosk } from "./kiosk.entity";
import { Payment } from "./payment.entity";
import { PrintToken } from "./print-token.entity";

export enum PrintJobStatus {
  Uploaded = "uploaded",
  OtpVerified = "otp_verified",
  PaymentPending = "payment_pending",
  ReviewReady = "review_ready",
  Paid = "paid",
  Printing = "printing",
  Printed = "printed",
  Failed = "failed",
  Refunded = "refunded"
}

@Entity({ name: "print_jobs" })
export class PrintJob {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Kiosk, { nullable: false })
  kiosk!: Kiosk;

  @ManyToOne(() => Customer, { nullable: false })
  customer!: Customer;

  @ManyToOne(() => FileAsset, { nullable: false })
  file!: FileAsset;

  @Column({ type: "enum", enum: PrintJobStatus })
  status!: PrintJobStatus;

  @Column({ type: "integer" })
  copies!: number;

  @Column({ type: "integer" })
  amountPaise!: number;

  @Column({ type: "integer" })
  ratePaise!: number;

  @Column({ type: "text", nullable: true })
  failureReason?: string;

  @OneToMany(() => Payment, (payment) => payment.printJob)
  payments!: Payment[];

  @OneToMany(() => PrintToken, (token) => token.printJob)
  tokens!: PrintToken[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
