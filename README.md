# SHENSTACK

A high-performance, type-safe full-stack framework for building modern web applications with speed and confidence.

## 🚀 Stack Overview

SHENSTACK combines cutting-edge technologies to create a seamless development experience:

- **Runtime**: [Bun](https://bun.sh/) - Ultra-fast JavaScript runtime
- **Frontend**:
  - [Next.js](https://nextjs.org/) - React framework with App Router
  - [ShadCN](https://ui.shadcn.com/) - Beautifully designed components
  - [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
  - [Framer Motion](https://www.framer.com/motion/) - Fluid animations
  - [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
  - [React Query](https://tanstack.com/query) - Data synchronization
  - [React Hook Form](https://react-hook-form.com/) - Form validation
- **Backend**:
  - [ElysiaJS](https://elysiajs.com/) - TypeScript HTTP framework
  - [DrizzleORM](https://orm.drizzle.team/) - Type-safe ORM
  - [Zod](https://zod.dev/) - Schema validation
- **Auth**:
  - Custom Auth (DIY implementation)
  - [BetterAuth/Clerk](https://clerk.com/) (Optional integrations)
- **Optional Integrations**:
  - Redis Cache for performance optimization
  - Sentry for error tracking and monitoring

## 🛠️ Getting Started

### Prerequisites

- Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- Node.js 18+ (for compatibility with certain tools)
- Database of your choice (PostgreSQL recommended)

### Installation

```bash
# Clone the repository
bunx create-shenstack

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
bun dev
```

## 🏗️ Project Structure

```
├── src/
│   ├── app/             # Next.js app directory
│   ├── components/      # UI components
│   │   ├── ui/          # ShadCN components
│   │   └── ...
│   ├── lib/             # Utility functions
│   ├── server/          # ElysiaJS API routes
│   ├── db/              # DrizzleORM schema and config
│   │   ├── schema/      # Database schema
│   │   └── index.ts     # DB client
│   ├── store/           # Zustand state management
│   └── types/           # TypeScript types
├── public/              # Static assets
├── drizzle/             # DrizzleORM migrations
├── tailwind.config.js   # TailwindCSS configuration
└── ...
```

## 📱 Frontend with Next.js

SHENSTACK leverages Next.js 14+ with the App Router architecture for a powerful, intuitive frontend development experience:

### Key Features

- **App Router**: Uses the modern `/app` directory structure for simplified routing
- **Server Components**: Default server-first approach for improved performance
- **Client Components**: Opt-in interactivity with the `'use client'` directive
- **Layouts**: Shared UI across routes with nested layouts
- **Server Actions**: Type-safe form handling directly from the server
- **Streaming**: Incremental page loading for improved UX
- **Image Optimization**: Automatic image processing with `next/image`

### Example App Structure

```
src/app/
├── (auth)/              # Auth-related routes grouped
│   ├── login/           # Login page
│   ├── register/        # Registration page
│   └── layout.tsx       # Shared auth layout
├── dashboard/           # Dashboard page
│   ├── page.tsx         # Main dashboard component
│   ├── layout.tsx       # Dashboard layout with navigation
│   └── [id]/            # Dynamic route for specific items
├── api/                 # API routes (if needed alongside Elysia)
├── layout.tsx           # Root layout with global providers
└── page.tsx             # Home page
```

### Integration with ShadCN and TailwindCSS

```tsx
// src/app/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"

export default function Dashboard() {
  return (
    <main className="p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2,345</p>
            <Link 
              href="/dashboard/users" 
              className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4" })}
            >
              View All
            </Link>
          </CardContent>
        </Card>
        {/* More cards */}
      </div>
    </main>
  )
}
```

## 🖥️ Backend with ElysiaJS

ElysiaJS provides a TypeScript-first API framework built for Bun that offers unparalleled developer experience:

### Key Features

- **Type Safety**: End-to-end type inference from request to response
- **Schema Validation**: Built-in schema validation with Zod integration
- **Middleware System**: Powerful plugin architecture
- **Performance**: Designed for Bun's high-performance runtime
- **Decorators**: Simple API decorators for common patterns
- **Swagger**: Automatic API documentation generation

### Basic Setup

SHENSTACK connects ElysiaJS to your Next.js app through a custom server:

```typescript
// src/server/index.ts
import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { userRoutes } from './routes/users'
import { authRoutes } from './routes/auth'
import { db } from '../db'

// Create the API server
export const app = new Elysia()
  .use(swagger())
  .use(cors())
  .decorate('db', db)
  .group('/api', app => app
    .use(userRoutes)
    .use(authRoutes)
  )
  .listen(3001)

console.log(`🦊 ElysiaJS API running at ${app.server?.hostname}:${app.server?.port}`)

// Types for type-safety
export type App = typeof app
```

### API Route Example

```typescript
// src/server/routes/users.ts
import { Elysia, t } from 'elysia'
import { auth } from '../middleware/auth'
import { users } from '../../db/schema'

export const userRoutes = new Elysia()
  .group('/users', app => app
    // Get all users (protected route)
    .get('/', 
      async ({ db }) => {
        return await db.query.users.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        })
      },
      { beforeHandle: [auth] }
    )
    
    // Get user by ID
    .get('/:id', 
      async ({ params, db }) => {
        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, params.id)
        })
        
        return user ?? { error: 'User not found' }
      },
      {
        params: t.Object({
          id: t.String()
        })
      }
    )
  )
```

## 🔄 State Management with Zustand

SHENSTACK uses Zustand for client-side state management, providing:

- Minimal API with a tiny footprint (~1KB)
- No boilerplate or providers needed
- Seamless integration with React Query for server state
- TypeScript support with no need for action types or reducers
- Optional persistence for specific state slices

### Store Structure

```typescript
// src/store/index.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
}

interface AppState {
  // Auth state
  user: User | null
  isAuthenticated: boolean
  
  // UI state
  theme: 'light' | 'dark' | 'system'
  
  // Actions
  setUser: (user: User | null) => void
  login: (user: User) => void
  logout: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      theme: 'system',
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ 
        user: state.user,
        theme: state.theme
      }),
    }
  )
)
```

### Example Usage

```tsx
// Using the store in components
import { useAppStore } from '@/store'

function Header() {
  const { user, theme, setTheme, logout } = useAppStore()
  
  return (
    <header className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white'}>
      <h1>Welcome, {user?.name || 'Guest'}</h1>
      <div className="flex space-x-2">
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          Toggle Theme
        </button>
        {user && <button onClick={logout}>Logout</button>}
      </div>
    </header>
  )
}
```

### Zustand with React Query

```tsx
import { useAppStore } from '@/store'
import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchProfile, updateProfile } from '@/lib/api'

function ProfilePage() {
  const { user } = useAppStore()
  
  // Get profile data with React Query
  const { data, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user?.id),
    enabled: !!user?.id,
  })
  
  // Update profile with React Query mutation
  const { mutate } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      // Handle success
    }
  })
  
  // Component rendering...
}
```

## 🔐 Authentication

SHENSTACK provides flexible authentication options:

### Custom Authentication (DIY)

SHENSTACK includes a foundation for implementing your own authentication system using:

- DrizzleORM for user storage
- Argon2/bcrypt for password hashing
- JWT or session-based auth
- Rate limiting with ElysiaJS middleware

The custom auth implementation is located in `src/lib/auth/custom.ts` and can be extended to your specific needs. This option is ideal for developers who need complete control over their authentication flow.

Basic setup:

```typescript
// src/lib/auth/custom.ts
import { db } from '@/db'
import { users } from '@/db/schema'
import { Argon2id } from 'oslo/password'

export async function registerUser(email: string, password: string) {
  const hashedPassword = await new Argon2id().hash(password)
  
  return db.insert(users).values({
    email,
    password: hashedPassword,
    createdAt: new Date()
  }).returning({ id: users.id })
}

export async function verifyCredentials(email: string, password: string) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email)
  })
  
  if (!user) return null
  
  const validPassword = await new Argon2id().verify(user.password, password)
  if (!validPassword) return null
  
  return { id: user.id, email: user.email }
}
```

### Third-Party Authentication

For faster implementation, SHENSTACK also supports:

#### Clerk

1. Set `AUTH_PROVIDER=clerk` in your `.env` file
2. Add your Clerk keys to `.env`
3. Follow the setup instructions in `src/lib/auth/clerk.ts`

#### BetterAuth

1. Set `AUTH_PROVIDER=betterauth` in your `.env` file
2. Configure BetterAuth according to `src/lib/auth/better-auth.ts`

## 🗃️ Database with DrizzleORM

SHENSTACK uses DrizzleORM for type-safe database operations:

```typescript
// src/db/schema/users.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
})

// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL || ''
const client = postgres(connectionString)
export const db = drizzle(client, { schema })
```

## 🧩 Optimizations and Integrations

### Redis Cache Integration

SHENSTACK provides optional Redis caching for improved performance:

```typescript
// src/lib/redis.ts
import { createClient } from 'redis'

const url = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis = createClient({ url })

// Connect on server startup
redis.connect().catch(console.error)

// Helper function for caching
export async function cachedData(key: string, fetchFn: () => Promise<any>, ttl = 3600) {
  const cached = await redis.get(key)
  
  if (cached) {
    return JSON.parse(cached)
  }
  
  const data = await fetchFn()
  await redis.set(key, JSON.stringify(data), { EX: ttl })
  
  return data
}
```

### Sentry Integration

For error tracking and monitoring:

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    })
  }
}
```

## 📊 Testing Strategy

SHENSTACK includes a comprehensive testing setup:

- **Unit Tests**: Using Bun's built-in test runner
- **Component Tests**: Using React Testing Library
- **API Tests**: Using Elysia's test utilities
- **End-to-End Tests**: Using Playwright

Example test:

```typescript
// src/components/Button.test.tsx
import { test, expect } from 'bun:test'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

test('Button renders correctly', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeDefined()
})
```

## 🚀 Deployment

SHENSTACK is designed to be deployed to any platform that supports Bun:

- [Vercel](https://vercel.com/) (Recommended for Next.js)
- [Fly.io](https://fly.io/)
- [Railway](https://railway.app/)
- Docker container (see `Dockerfile`)

### Docker Deployment

```dockerfile
# Dockerfile
FROM oven/bun:latest as builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:latest

WORKDIR /app

COPY --from=builder /app/package.json /app/bun.lockb ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
CMD ["bun", "start"]
```

## 🌱 Environment Variables

SHENSTACK uses the following environment variables:

```
# Database
DATABASE_URL=postgres://username:password@localhost:5432/mydb

# Authentication
AUTH_PROVIDER=custom  # Or 'clerk' or 'betterauth'
JWT_SECRET=your-secret-key

# Clerk (if using Clerk auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Sentry (optional)
SENTRY_DSN=https://...

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3001
