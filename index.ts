#!/usr/bin/env bun
import { $ } from "bun";
import { input, select, confirm } from "@inquirer/prompts";
import fs from "fs";
import path from "path";
import chalk from "chalk";

interface ShenStackOptions {
  projectName: string;
  authOption: "diy" | "betterauth" | "clerk";
  useRedis: boolean;
  useSentry: boolean;
}

async function main() {
  console.log(chalk.bold.blue("\n🚀 Welcome to SHENSTACK Generator 🚀\n"));
  console.log(
    chalk.cyan(
      "SHENSTACK combines cutting-edge technologies for a seamless development experience.\n"
    )
  );

  const options = await promptForOptions();

  await createProject(options);
}

async function promptForOptions(): Promise<ShenStackOptions> {
  const projectName = await input({
    message: "What is your project name?",
    default: "shenstack-app",
    validate: (input) => {
      if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
        return "Project name can only contain letters, numbers, dashes, and underscores";
      }
      if (fs.existsSync(input)) {
        return `Directory ${input} already exists`;
      }
      return true;
    },
  });

  const authOption: "diy" | "betterauth" | "clerk" = await select({
    message: "Select authentication method:",
    choices: [
      { value: "diy", name: "Custom Auth (DIY implementation)" },
      { value: "betterauth", name: "BetterAuth" },
      { value: "clerk", name: "Clerk" },
    ],
  });

  const useRedis = await confirm({
    message: "Do you want to include Redis for caching?",
    default: false,
  });

  const useSentry = await confirm({
    message: "Do you want to integrate Sentry for error tracking?",
    default: false,
  });

  return {
    projectName,
    authOption,
    useRedis,
    useSentry,
  };
}

async function createProject(options: ShenStackOptions) {
  const { projectName, authOption, useRedis, useSentry } = options;

  console.log(chalk.cyan("\nCreating your SHENSTACK project...\n"));

  try {
    // Clone the template repository
    console.log(chalk.yellow("Cloning template repository..."));
    await $`git clone --depth 1 https://github.com/heywinit/create-shenstack-app.git ${projectName}`;

    // Change into project directory and remove git history
    process.chdir(projectName);
    fs.rmSync(".git", { recursive: true, force: true });

    // Initialize new git repository
    console.log(chalk.yellow("Initializing fresh git repository..."));
    await $`git init`;

    // Install dependencies
    console.log(chalk.yellow("\nInstalling dependencies..."));
    await $`bun install`;

    // Install optional dependencies based on user choices
    if (authOption !== "diy") {
      console.log(chalk.yellow(`\nInstalling ${authOption} authentication...`));
      if (authOption === "clerk") {
        await $`bun add @clerk/nextjs`;
      } else if (authOption === "betterauth") {
        await $`bun add better-auth`;
      }
    }

    if (useRedis) {
      console.log(chalk.yellow("\nInstalling Redis..."));
      await $`bun add ioredis`;
    }

    if (useSentry) {
      console.log(chalk.yellow("\nInstalling Sentry..."));
      await $`bun add @sentry/nextjs`;
      await $`bunx @sentry/wizard@latest -i nextjs`;
    }

    // Create environment files
    createEnvFile(options);

    // Print success message
    printSuccessMessage(options);
  } catch (error) {
    console.error(chalk.red("\nError creating SHENSTACK project:"));
    console.error(error);
    process.exit(1);
  }
}

async function setupFileStructure() {
  console.log(chalk.yellow("\nSetting up file structure..."));

  // Create required directories if they don't exist
  const directories = [
    "src/lib/db",
    "src/lib/utils",
    "src/store",
    "src/app/api",
    "src/components/custom",
  ];

  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Update page.tsx with SHENSTACK branding
  const pageContent = `
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">
            Welcome to <span className="text-blue-600">SHENSTACK</span>
          </CardTitle>
          <CardDescription className="text-center text-lg">
            The modern full-stack development experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                title="Frontend"
                items={["Next.js", "ShadCN UI", "TailwindCSS", "Zustand", "React Query"]}
              />
              <FeatureCard
                title="Backend"
                items={["ElysiaJS", "DrizzleORM", "Bun Runtime"]}
              />
            </div>
            <div className="flex justify-center mt-6">
              <Button asChild>
                <Link href="/api/hello">
                  Test API Endpoint
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function FeatureCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="font-semibold text-lg mb-2">{title}</h2>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-sm flex items-center gap-2">
            <span className="text-green-500">✓</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
`;
  fs.writeFileSync("src/app/page.tsx", pageContent);
}

function createReadme(options: ShenStackOptions) {
  console.log(chalk.yellow("\nCreating README..."));

  const readmeContent = `
# ${options.projectName}

This project was generated with the SHENSTACK generator.

## SHENSTACK Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Ultra-fast JavaScript runtime
- **Frontend**:
  - [Next.js](https://nextjs.org/) - React framework with App Router
  - [ShadCN](https://ui.shadcn.com/) - Beautifully designed components
  - [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
  - [Framer Motion](https://www.framer.com/motion/) - Fluid animations
  - [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
  - [React Query](https://tanstack.com/query) - Data synchronization
  - [React Hook Form](https://react-hook-form.com/) - Form validation
  - [Zod](https://zod.dev/) - Schema validation
- **Backend**:
  - [ElysiaJS](https://elysiajs.com/) - TypeScript HTTP framework
  - [DrizzleORM](https://orm.drizzle.team/) - Type-safe ORM
${
  options.authOption === "diy"
    ? "Custom Auth (DIY implementation)"
    : options.authOption === "betterauth"
    ? "[BetterAuth](https://www.better-auth.com/)"
    : "[Clerk](https://clerk.com/)"
}

${
  options.useRedis || options.useSentry
    ? `- **Integrations**:
${options.useRedis ? "  - Redis Cache for performance optimization" : ""}
${options.useSentry ? "  - Sentry for error tracking and monitoring" : ""}`
    : ""
}

## Getting Started

\`\`\`
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

\`\`\`
src/
├── app/              # Next.js App Router
│   ├── api/          # API routes
│   └── ...           # Page routes
├── components/       # React components
│   ├── ui/           # ShadCN UI components
│   └── custom/       # Custom components
├── lib/              # Utility functions and libraries
│   ├── db/           # Database setup and models
│   └── utils/        # Helper functions
└── store/            # Zustand state management
\`\`\`

## Database Setup

This project uses DrizzleORM. Configure your database connection in \`src/lib/db/index.ts\`.

## Learn More

To learn more about the SHENSTACK, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Bun Documentation](https://bun.sh/docs)
- [ElysiaJS Documentation](https://elysiajs.com/quick-start.html)
- [DrizzleORM Documentation](https://orm.drizzle.team/docs/overview)
- [ShadCN UI](https://ui.shadcn.com/)
`;

  fs.writeFileSync("README.md", readmeContent);
}

function createEnvFile(options: ShenStackOptions) {
  console.log(chalk.yellow("\nCreating .env.example file..."));

  let envContent = `# Environment variables
NODE_ENV=development

# Database configuration
DATABASE_URL="postgres://user:password@localhost:5432/your_database"
`;

  if (options.authOption === "betterauth") {
    envContent += `
# BetterAuth credentials
BETTER_AUTH_API_KEY=your_api_key_here
`;
  } else if (options.authOption === "clerk") {
    envContent += `
# Clerk credentials
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here
`;
  }

  if (options.useRedis) {
    envContent += `
# Redis configuration
REDIS_URL=redis://localhost:6379
`;
  }

  if (options.useSentry) {
    envContent += `
# Sentry configuration
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
`;
  }

  fs.writeFileSync(".env.example", envContent);
  fs.writeFileSync(".env.local", envContent);
}

function setupDrizzle() {
  console.log(chalk.yellow("\nSetting up DrizzleORM with PostgreSQL..."));

  // Create drizzle config file
  const drizzleConfigContent = `
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
`;
  fs.writeFileSync("drizzle.config.ts", drizzleConfigContent);

  // Create basic schema file
  const schemaContent = `
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content"),
  userId: uuid("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
`;
  fs.writeFileSync("src/lib/db/schema.ts", schemaContent);

  // Create db client
  const dbClientContent = `
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { neon } from '@neondatabase/serverless';
import * as schema from "./schema";

let db: ReturnType<typeof drizzle>;

// Initialize database connection
export function getDb() {
  if (!db) {
    const sql = neon(process.env.DATABASE_URL!);
    db = drizzle(sql, { schema });
  }
  return db;
}

// Initialize database with migration
export async function initDb() {
  console.log("Initializing database...");
  // In a real app, you would run migrations here using:
  // await migrate(db, { migrationsFolder: "./drizzle" })
}
`;
  fs.writeFileSync("src/lib/db/index.ts", dbClientContent);

  // Update db operations file - only the imports need to change
  const dbUtilsContent = `
import { getDb } from ".";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

// Rest of the operations remain the same, but now we don't need nanoid since we're using UUID
export const userOperations = {
  async getAll() {
    const db = getDb();
    return db.select().from(schema.users);
  },
  
  async getById(id: string) {
    const db = getDb();
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  },
  
  async create(data: Omit<schema.NewUser, "id" | "createdAt" | "updatedAt">) {
    const db = getDb();
    const newUser: schema.NewUser = {
      ...data,
    };
    
    const [inserted] = await db.insert(schema.users).values(newUser).returning();
    return inserted;
  },
  
  async update(id: string, data: Partial<Omit<schema.NewUser, "id" | "createdAt">>) {
    const db = getDb();
    const [updated] = await db.update(schema.users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    
    return updated;
  },
  
  async delete(id: string) {
    const db = getDb();
    await db.delete(schema.users).where(eq(schema.users.id, id));
    return true;
  }
};

// Post operations remain similar, just removing nanoid usage since we're using UUID
export const postOperations = {
  // ... same operations as before, but using UUID ...
};
`;
  fs.writeFileSync("src/lib/db/operations.ts", dbUtilsContent);
}

function setupZustand() {
  console.log(chalk.yellow("\nSetting up Zustand store..."));

  const storeContent = `
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isLoggedIn: boolean;
  user: { id: string; name: string; email: string } | null;
  login: (user: { id: string; name: string; email: string }) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      isLoggedIn: false,
      user: null,
      login: (user) => set({ isLoggedIn: true, user }),
      logout: () => set({ isLoggedIn: false, user: null }),
    }),
    {
      name: 'app-storage',
    }
  )
);
`;
  fs.writeFileSync("src/store/appStore.ts", storeContent);
}

function setupElysia() {
  console.log(chalk.yellow("\nSetting up ElysiaJS API..."));

  // Create API route
  const apiDir = "src/app/api";
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  // Create hello route
  const helloDir = `${apiDir}/hello`;
  if (!fs.existsSync(helloDir)) {
    fs.mkdirSync(helloDir, { recursive: true });
  }

  const helloRouteContent = `
export async function GET() {
  return Response.json({
    message: "Hello from SHENSTACK!",
    timestamp: new Date().toISOString(),
    stack: {
      runtime: "Bun",
      frontend: "Next.js + ShadCN",
      backend: "ElysiaJS + DrizzleORM",
    }
  });
}
`;
  fs.writeFileSync(`${helloDir}/route.ts`, helloRouteContent);

  // Create users API using Elysia
  // We'll create a more appropriate structure for combining Next.js and Elysia
  const elysiaSetupContent = `
// This file demonstrates how to use ElysiaJS with Next.js
// In a real app, you might implement your own API adapter

import { Elysia } from 'elysia';
import { getDb } from '@/lib/db';
import { userOperations, postOperations } from '@/lib/db/operations';

// Create the Elysia app
const app = new Elysia()
  .get('/', () => ({ message: 'SHENSTACK API is running' }))
  .group('/users', app => app
    .get('/', async () => {
      const users = await userOperations.getAll();
      return users;
    })
    .get('/:id', async ({ params }) => {
      const user = await userOperations.getById(params.id);
      if (!user) return new Response('User not found', { status: 404 });
      return user;
    })
    .post('/', async ({ body }) => {
      try {
        // In a real app, validate the body with zod
        const newUser = await userOperations.create(body as any);
        return { success: true, user: newUser };
      } catch (error) {
        return new Response('Invalid user data', { status: 400 });
      }
    })
    .put('/:id', async ({ params, body }) => {
      try {
        const updatedUser = await userOperations.update(params.id, body as any);
        if (!updatedUser) return new Response('User not found', { status: 404 });
        return { success: true, user: updatedUser };
      } catch (error) {
        return new Response('Invalid user data', { status: 400 });
      }
    })
    .delete('/:id', async ({ params }) => {
      await userOperations.delete(params.id);
      return { success: true };
    })
  );

// Export a function that handles the request
export async function elysiaHandler(req: Request): Promise<Response> {
  return await app.handle(req);
}
`;
  fs.writeFileSync("src/lib/elysia.ts", elysiaSetupContent);

  // Create users API endpoint
  const usersDir = `${apiDir}/users`;
  if (!fs.existsSync(usersDir)) {
    fs.mkdirSync(usersDir, { recursive: true });
  }

  const usersRouteContent = `
import { elysiaHandler } from '@/lib/elysia';

export function GET(req: Request) {
  return elysiaHandler(req);
}

export function POST(req: Request) {
  return elysiaHandler(req);
}

export function PUT(req: Request) {
  return elysiaHandler(req);
}

export function DELETE(req: Request) {
  return elysiaHandler(req);
}
`;
  fs.writeFileSync(`${usersDir}/route.ts`, usersRouteContent);

  // Create [id] route
  const userIdDir = `${usersDir}/[id]`;
  if (!fs.existsSync(userIdDir)) {
    fs.mkdirSync(userIdDir, { recursive: true });
  }

  const userIdRouteContent = `
import { elysiaHandler } from '@/lib/elysia';

export function GET(req: Request) {
  return elysiaHandler(req);
}

export function PUT(req: Request) {
  return elysiaHandler(req);
}

export function DELETE(req: Request) {
  return elysiaHandler(req);
}
`;
  fs.writeFileSync(`${userIdDir}/route.ts`, userIdRouteContent);
}

function printSuccessMessage(options: ShenStackOptions) {
  console.log(
    chalk.green.bold("\n✅ SHENSTACK project created successfully!\n")
  );

  console.log(
    chalk.cyan(
      `Your new SHENSTACK project is ready in ${chalk.bold(
        options.projectName
      )}`
    )
  );
  console.log(chalk.cyan("\nThe following technologies have been set up:"));

  console.log("- Next.js with App Router");
  console.log("- ShadCN components");
  console.log("- TailwindCSS");
  console.log("- Framer Motion");
  console.log("- Zustand");
  console.log("- React Query");
  console.log("- React Hook Form with Zod");
  console.log("- ElysiaJS");
  console.log("- DrizzleORM");

  console.log(
    `- Authentication: ${
      options.authOption === "diy"
        ? "Custom Auth (DIY)"
        : options.authOption === "betterauth"
        ? "BetterAuth"
        : "Clerk"
    }`
  );

  if (options.useRedis) {
    console.log("- Redis cache integration");
  }

  if (options.useSentry) {
    console.log("- Sentry error tracking");
  }

  console.log(chalk.cyan(`\nTo get started:\n`));
  console.log(`  cd ${options.projectName}`);
  console.log(`  bun dev\n`);

  console.log(chalk.cyan("Then open http://localhost:3000 in your browser.\n"));
}

// Run the script
main().catch(console.error);
