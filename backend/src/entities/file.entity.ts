import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PrintJob } from "./print-job.entity";

@Entity({ name: "files" })
export class FileAsset {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  storagePath!: string;

  @Column({ type: "text" })
  originalName!: string;

  @Column({ type: "integer" })
  sizeBytes!: number;

  @Column({ type: "integer" })
  pageCount!: number;

  @Column({ type: "text" })
  mimeType!: string;

  @OneToMany(() => PrintJob, (job) => job.file)
  printJobs!: PrintJob[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
