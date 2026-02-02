# Promptr

<div align="center">
  <img src="public/favicon.png" alt="Promptr Logo" width="80" height="80">
  
  **AI-Powered Prompt Refinement for VS Code**
  
  Transform vague feature requests into clear, AI-ready prompts tailored to your tech stack.
  
  [Website](https://promptr.dev) • [Documentation](#documentation) • [VS Code Extension](#installation)
  
  ![License](https://img.shields.io/badge/license-MIT-blue.svg)
  ![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)
</div>

---

## 🚀 What is Promptr?

Promptr is a VS Code extension that helps developers get better code from AI assistants like Cursor, Windsurf, and GitHub Copilot. Simply describe what you want to build, and Promptr transforms your vague requests into precise, detailed prompts that AI understands perfectly.

### Key Features

- **Smart Prompt Refinement**: Turn "add a login page" into a detailed, context-aware specification
- **Tech Stack Awareness**: Automatically considers your project's framework, libraries, and patterns
- **Multi-Editor Support**: Works with VS Code, Cursor, Windsurf, and more
- **Creativity Control**: Adjust from precise technical specs to exploratory suggestions
- **Real-time Streaming**: Watch your prompts refine in real-time
- **Custom Context**: Add project docs, style guides, or specific requirements

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation](#installation)
  - [Using npm](#using-npm)
  - [Using Docker](#using-docker)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [Project Structure](#project-structure)
- [Supabase Functions](#supabase-functions)
- [Stripe Integration](#stripe-integration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**
- **Supabase CLI** (for edge functions)
- **Stripe CLI** (for payment testing)

Optional:
- **Docker** & **Docker Compose** (for containerized development)

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/AryanSudhirDev/promptr-website.git
cd promptr-website

# Install dependencies
npm install

# Set up environment variables (see Environment Setup section)
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Installation

### Using npm

1. **Clone the repository**
   ```bash
   git clone https://github.com/AryanSudhirDev/promptr-website.git
   cd promptr-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   This will install all required packages including:
   - `react` & `react-dom` - Core React library
   - `framer-motion` - Animation library for smooth transitions
   - `lottie-react` - Lottie animation player
   - `embla-carousel-react` - Carousel component for testimonials
   - `@radix-ui/*` - Accessible UI primitives
   - `@clerk/clerk-react` - Authentication
   - `@supabase/supabase-js` - Database client
   - `tailwindcss` - Utility-first CSS
   - `lucide-react` - Icon library

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your credentials (see [Environment Setup](#environment-setup))

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Using Docker

For a containerized development environment:

1. **Create a `Dockerfile`** (if not exists):
   ```dockerfile
   FROM node:20-alpine

   WORKDIR /app

   # Install dependencies
   COPY package*.json ./
   RUN npm ci

   # Copy source
   COPY . .

   # Expose port
   EXPOSE 5173

   # Start dev server
   CMD ["npm", "run", "dev", "--", "--host"]
   ```

2. **Create `docker-compose.yml`**:
   ```yaml
   version: '3.8'
   
   services:
     web:
       build: .
       ports:
         - "5173:5173"
       volumes:
         - .:/app
         - /app/node_modules
       environment:
         - VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}
         - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
         - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
       command: npm run dev -- --host
   ```

3. **Run with Docker Compose**:
   ```bash
   # Build and start
   docker-compose up --build
   
   # Run in background
   docker-compose up -d
   
   # Stop
   docker-compose down
   ```

---

## Environment Setup

### Frontend Environment Variables

Create a `.env` file in the project root:

```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Edge Functions Environment

Set these in **Supabase Dashboard → Edge Functions → Secrets**:

```bash
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SITE_URL=https://your-production-domain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Clerk (for token validation)
CLERK_DOMAIN=your-clerk-domain.clerk.accounts.dev
```

### Getting Your Keys

| Service | Where to Find |
|---------|---------------|
| Clerk | [Clerk Dashboard](https://dashboard.clerk.com) → API Keys |
| Supabase | [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API |
| Stripe | [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API Keys |

---

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at localhost:5173 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors automatically |
| `npm run type-check` | Run TypeScript type checking |
| `npm run clean` | Remove dist and node_modules |
| `npm run deploy:functions` | Deploy Supabase Edge Functions |

### Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion + Lottie
- **UI Components**: Radix UI primitives
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Hosting**: Vercel (recommended)

---

## Project Structure

```
promptr-website/
├── public/                    # Static assets
│   ├── favicon.png
│   └── promptr-demo.gif
├── src/
│   ├── components/           # React components
│   │   ├── ui/               # Base UI components (Button, Card, etc.)
│   │   ├── AccountDashboard.tsx
│   │   ├── AuthWrapper.tsx
│   │   ├── CheckoutRedirect.tsx
│   │   ├── CTA.tsx
│   │   ├── FAQ.tsx
│   │   ├── Features.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Navigation.tsx
│   │   ├── NotificationSystem.tsx
│   │   ├── Pricing.tsx
│   │   └── Testimonials.tsx
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   ├── utils/                # Helper utilities
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── supabase/
│   ├── functions/            # Edge Functions
│   │   ├── _shared/          # Shared utilities
│   │   ├── create-checkout-session/
│   │   ├── stripe-webhooks/
│   │   ├── manage-subscription/
│   │   ├── get-user-token/
│   │   └── ...
│   └── migrations/           # Database migrations
├── DESIGN_PRD.md             # Design specifications
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Supabase Functions

### Deploying Edge Functions

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link your project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Deploy functions**
   ```bash
   # Deploy all functions
   supabase functions deploy
   
   # Deploy specific function
   supabase functions deploy create-checkout-session
   ```

### Available Functions

| Function | Purpose |
|----------|---------|
| `create-checkout-session` | Creates Stripe checkout session |
| `stripe-webhooks` | Handles Stripe webhook events |
| `manage-subscription` | Get status, cancel, manage billing |
| `get-user-token` | Retrieves user's access token |
| `check-usage-limit` | Checks usage against plan limits |
| `validate-token` | Validates access tokens for VS Code extension |

---

## Stripe Integration

### Setting Up Webhooks

1. **In Stripe Dashboard** → Developers → Webhooks

2. **Add endpoint**:
   ```
   https://your-project.supabase.co/functions/v1/stripe-webhooks
   ```

3. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. **Copy webhook secret** to Supabase Edge Function secrets as `STRIPE_WEBHOOK_SECRET`

### Testing Locally

```bash
# Forward webhooks to local
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhooks

# Trigger test events
stripe trigger checkout.session.completed
```

---

## Deployment

### Vercel (Recommended)

1. **Connect GitHub repo** to Vercel

2. **Set environment variables** in Vercel dashboard:
   ```
   VITE_CLERK_PUBLISHABLE_KEY
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Manual Deployment

```bash
# Build
npm run build

# Preview locally
npm run preview

# Deploy dist/ folder to your hosting provider
```

---

## Database Schema

### user_access Table

```sql
CREATE TABLE user_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  access_token UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'trialing',
  plan_type VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Running Migrations

```bash
supabase db push
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing component patterns
- Run `npm run lint` before committing
- Write meaningful commit messages

---

## Troubleshooting

### Common Issues

**"VITE_SUPABASE_URL is undefined"**
- Ensure `.env` file exists and variables are prefixed with `VITE_`
- Restart dev server after changing `.env`

**"Stripe checkout not working"**
- Verify Stripe price IDs match your Stripe dashboard
- Check Supabase Edge Function logs for errors
- Ensure webhook secret is correctly set

**"Authentication errors"**
- Verify Clerk publishable key is correct
- Check Clerk dashboard for any domain restrictions

### Getting Help

- Check [existing issues](https://github.com/AryanSudhirDev/promptr-website/issues)
- Open a new issue with detailed description
- Include error logs and reproduction steps

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built with ❤️ for developers who want better AI-generated code</strong>
  
  [⬆ Back to top](#promptr)
</div>
