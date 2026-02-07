import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PrintJob } from "./print-job.entity";

export enum PaymentStatus {
  Created = "created",
  Authorized = "authorized",
  Captured = "captured",
  Failed = "failed",
  Refunded = "refunded"
}

@Entity({ name: "payments" })
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => PrintJob, (job) => job.payments, { nullable: false })
  printJob!: PrintJob;

  @Column({ type: "text" })
  provider!: string;

  @Column({ type: "text" })
  providerOrderId!: string;

  @Column({ type: "text", nullable: true })
  providerPaymentId?: string;

  @Column({ type: "integer" })
  amountPaise!: number;

  @Column({ type: "enum", enum: PaymentStatus })
  status!: PaymentStatus;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
