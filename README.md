# SHENSTACK

A high-performance, full-stack framework for building modern web applications with speed and confidence.

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
  - [Zod](https://zod.dev/) - Schema validation
- **Backend**:
  - [ElysiaJS](https://elysiajs.com/) - TypeScript HTTP framework
  - [DrizzleORM](https://orm.drizzle.team/) - Type-safe ORM
- **Auth**:
  - Custom Auth (DIY implementation)
  - [BetterAuth](https://www.better-auth.com/)
  - [Clerk](https://clerk.com/) (Optional integrations)
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

# Run development servers
cd api && bun dev
cd app && bun dev
```
