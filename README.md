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
git clone https://github.com/yourusername/shenstack-project.git
cd shenstack-project

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

## 🔄 State Management with Zustand

SHENSTACK uses Zustand for client-side state management, providing:

- Minimal API with a tiny footprint (~1KB)
- No boilerplate or providers needed
- Seamless integration with React Query for server state
- TypeScript support with no need for action types or reducers
- Optional persistence for specific state slices

Example usage:

```typescript
// Using the store in components
import { useAppStore } from '@/store'

function Header() {
  const { user, theme, toggleTheme } = useAppStore()
  
  return (
    <header className={theme === 'dark' ? 'bg-slate-900' : 'bg-white'}>
      <h1>Welcome, {user?.name || 'Guest'}</h1>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </header>
  )
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

## 🚀 Deployment

SHENSTACK is designed to be deployed to any platform that supports Bun:

- [Vercel](https://vercel.com/) (Recommended for Next.js)
- [Fly.io](https://fly.io/)
- [Railway](https://railway.app/)
- Docker container (see `Dockerfile`)

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [ElysiaJS Documentation](https://elysiajs.com/introduction.html)
- [DrizzleORM Documentation](https://orm.drizzle.team/docs/overview)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
