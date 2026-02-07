import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Customer } from "./customer.entity";

export enum OtpPurpose {
  UploadVerification = "upload_verification",
  PrintRelease = "print_release"
}

export enum OtpStatus {
  Pending = "pending",
  Verified = "verified",
  Expired = "expired"
}

@Entity({ name: "otp_sessions" })
export class OtpSession {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Customer, (customer) => customer.otpSessions, { nullable: false })
  customer!: Customer;

  @Column({ type: "text" })
  otpCode!: string;

  @Column({ type: "enum", enum: OtpPurpose })
  purpose!: OtpPurpose;

  @Column({ type: "enum", enum: OtpStatus })
  status!: OtpStatus;

  @Column({ type: "timestamptz" })
  expiresAt!: Date;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
