#!/usr/bin/env bun
import { $ } from "bun";
import prompts from "prompts";
import chalk from "chalk";
import fs from "fs";
import path from "path";

async function main() {
  console.log(chalk.cyan("\n🚀 Welcome to Shenstack Setup!\n"));

  // Get all user input upfront before starting operations
  const questions = await prompts([
    {
      type: "text",
      name: "projectName",
      message: "What is your project name?",
      initial: "my-shenstack-app",
    },
    {
      type: "confirm",
      name: "useRedis",
      message: "Would you like to include Redis?",
      initial: false,
    },
    {
      type: "confirm",
      name: "useSentry",
      message: "Would you like to include Sentry for error tracking?",
      initial: false,
    },
  ]);

  // Check if user cancelled
  if (!questions.projectName) {
    console.log(chalk.red("\nSetup cancelled"));
    process.exit(1);
  }

  const { projectName, useRedis, useSentry } = questions;

  // Create project directory
  const projectDir = path.join(process.cwd(), projectName);

  console.log(chalk.yellow("\n📦 Creating project directory..."));
  fs.mkdirSync(projectDir, { recursive: true });
  process.chdir(projectDir);

  // Clone base repository
  console.log(chalk.yellow("\n🔄 Cloning Shenstack template..."));
  await $`git clone https://github.com/heywinit/create-shenstack-app.git .`;
  await $`rm -rf .git`;
  await $`git init`;

  // Install dependencies for both api and app projects
  console.log(chalk.yellow("\n📥 Installing dependencies..."));

  // Install API dependencies
  console.log(chalk.cyan("Installing API dependencies..."));
  if (fs.existsSync(path.join(projectDir, "api"))) {
    process.chdir(path.join(projectDir, "api"));
    await $`bun install`;

    if (useRedis) {
      console.log(chalk.yellow("\n🔄 Setting up Redis..."));
      await $`bun add ioredis`;
    }

    if (useSentry) {
      console.log(chalk.yellow("\n🔄 Setting up Sentry in API..."));
      await $`bun add @sentry/node @sentry/bun`;
    }
  }

  // Install App dependencies
  console.log(chalk.cyan("\nInstalling App dependencies..."));
  if (fs.existsSync(path.join(projectDir, "app"))) {
    process.chdir(path.join(projectDir, "app"));
    await $`bun install`;

    if (useSentry) {
      console.log(chalk.yellow("\n🔄 Setting up Sentry in App..."));
      await $`bun add @sentry/react`;
    }
  }

  // Return to project root
  process.chdir(projectDir);

  if (useRedis) {
    // Create Redis configuration in api project
    const redisConfig = `
import { Redis } from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

export default redis;
`;

    fs.writeFileSync(
      path.join(projectDir, "api/src/lib/redis.ts"),
      redisConfig
    );

    // Update API .env.example
    fs.appendFileSync(
      path.join(projectDir, "api/.env.example"),
      "\nREDIS_HOST=localhost\nREDIS_PORT=6379\n"
    );
  }

  if (useSentry) {
    // Create Sentry configuration for API
    const sentryConfigApi = `
import * as Sentry from "@sentry/bun";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

export default Sentry;
`;

    // Create Sentry configuration for App
    const sentryConfigApp = `
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});

export default Sentry;
`;

    // Ensure lib directories exist
    fs.mkdirSync(path.join(projectDir, "api/src/lib"), { recursive: true });
    fs.mkdirSync(path.join(projectDir, "app/src/lib"), { recursive: true });

    fs.writeFileSync(
      path.join(projectDir, "api/src/lib/sentry.ts"),
      sentryConfigApi
    );
    fs.writeFileSync(
      path.join(projectDir, "app/src/lib/sentry.ts"),
      sentryConfigApp
    );

    // Update env files for both projects
    fs.appendFileSync(
      path.join(projectDir, "api/.env.example"),
      "\nSENTRY_DSN=your-sentry-dsn\n"
    );
    fs.appendFileSync(
      path.join(projectDir, "app/.env.example"),
      "\nNEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn\n"
    );
  }

  // Clear screen before showing completion message
  console.clear();
  console.log(chalk.green("\n✨ Project setup complete!"));
  console.log(chalk.cyan("\nNext steps:"));
  console.log(chalk.white(`1. cd ${projectName}`));
  console.log(
    chalk.white("2. Copy .env.example to .env and update the values")
  );
  console.log(chalk.white("3. Run 'bun dev' to start the development server"));

  if (useRedis) {
    console.log(chalk.white("\nRedis setup:"));
    console.log(chalk.white("1. Make sure Redis is installed and running"));
    console.log(
      chalk.white("2. Update REDIS_HOST and REDIS_PORT in .env if needed")
    );
  }

  if (useSentry) {
    console.log(chalk.white("\nSentry setup:"));
    console.log(chalk.white("1. Create a Sentry project and get your DSN"));
    console.log(chalk.white("2. Add your SENTRY_DSN to .env"));
  }
}

main().catch((err) => {
  console.error(chalk.red("Error:"), err);
  process.exit(1);
});
