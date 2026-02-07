import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import express from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.use("/payments/webhook", express.raw({ type: "application/json" }));
  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
  console.log(`Backend listening on :${port}`);
}

bootstrap();
