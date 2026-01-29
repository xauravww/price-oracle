# Price Oracle

A Next.js AI-powered price transparency engine that helps users verify if they're getting fair deals by cross-referencing historical data, live web intelligence, and semantic search.

## Features

- **Intelligent Price Analysis**: Ask natural language questions like "Is iPhone 15 Pro for ₹120,000 a good deal?"
- **Vector Semantic Search**: Find similar products using PostgreSQL pgvector extension
- **Live Web Scraping**: Real-time market data with automatic fallback (DuckDuckGo → Serper.dev)
- **AI-Powered Verdicts**: Get instant analysis from Llama/GPT models
- **Admin Dashboard**: Manage trusted sources, view logs, and system analytics
- **Production-Ready**: Bulletproof search that works on Vercel with automatic failover

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Vector Search**: pgvector extension
- **Web Search**: Multi-provider (DuckDuckGo, Serper.dev), Jina Reader
- **AI**: Groq (Llama 3.1) / OpenAI API
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (with pgvector extension)
  - Recommended providers: [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app), or Vercel Postgres

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd price-oracle
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```bash
   # Database
   DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

   # AI Service
   AI_CLIENT_API_KEY=your_api_key_here
   AI_SERVICE_URL=http://localhost:3010/v1/chat/completions

   # Web Search (Optional but recommended for production)
   # Free tier: 2,500 searches/month - Get your key at https://serper.dev
   SERPER_API_KEY=your_serper_api_key_here

   # Admin Credentials (for production deployment)
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password_here
   ```

   > 💡 **Important for Vercel deployment**: Get a free Serper.dev API key to avoid search errors.  
   > See [docs/SEARCH_SETUP.md](./docs/SEARCH_SETUP.md) for detailed instructions.

4. Set up the database:
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Push schema to database (creates tables)
   npx prisma db push

   # Optional: Open Prisma Studio to view database
   npx prisma studio
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

This project uses PostgreSQL with the pgvector extension for vector similarity search. You have several options:

### Option 1: Neon (Recommended)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string and add it to your `.env` as `DATABASE_URL`
4. Neon includes pgvector by default

### Option 2: Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Enable the pgvector extension in SQL Editor:
   ```sql
   create extension if not exists vector;
   ```
3. Copy the connection string from Settings > Database

### Option 3: Railway
1. Create a PostgreSQL database at [railway.app](https://railway.app)
2. Install pgvector extension
3. Use the provided connection string

### Option 4: Vercel Postgres
1. Add Vercel Postgres to your project
2. The extension is automatically available

## Deployment to Vercel

1. Push your code to GitHub

2. Import your repository to Vercel

3. Configure environment variables in Vercel dashboard:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `AI_CLIENT_API_KEY` - Your AI service API key
   - `AI_SERVICE_URL` - AI service endpoint
   - `SERPER_API_KEY` - **[Required]** Your Serper.dev API key (prevents search errors)
   - `ADMIN_USERNAME` - Admin username
   - `ADMIN_PASSWORD` - Secure admin password

   > ⚠️ **Critical**: Add `SERPER_API_KEY` to avoid DuckDuckGo 403 errors on Vercel.  
   > Get free key at [serper.dev](https://serper.dev) (2,500 searches/month free)

4. Deploy! Vercel will automatically:
   - Run `prisma generate`
   - Build your Next.js app
   - Deploy to production

The `vercel.json` configuration is already set up to handle Prisma generation during build.

## API Endpoints

- `GET/POST /` - Main price query interface
- `/api/*` - Server actions for database operations
- `/admin/login` - Admin authentication
- `/admin/dashboard` - System analytics
- `/admin/sources` - Manage trusted web sources
- `/admin/logs` - Query logs and performance

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open database GUI
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate dev` - Create and apply migrations (for production)

## Project Structure

```
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/                # Next.js app router pages
│   │   ├── admin/          # Admin dashboard routes
│   │   ├── demo/           # Demo page
│   │   └── docs/           # Documentation
│   ├── components/         # React components
│   │   ├── admin/          # Admin-specific components
│   │   └── ui/             # Reusable UI components
│   └── lib/
│       ├── actions.ts      # Server actions & database queries
│       ├── db.ts           # Prisma client & vector embeddings
│       ├── priceEngine.ts  # Core price analysis logic
│       └── searchService.ts# Web search utilities
├── public/                 # Static assets
├── scripts/                # Test and utility scripts
│   ├── test-search-system.mjs  # Main integration test (use this!)
│   ├── test-serper.js          # Serper API key validator
│   └── test-searxng.js         # SearXNG instance tester
├── docs/                   # Documentation
│   ├── SEARCH_SETUP.md         # Serper.dev setup guide
│   ├── MULTI_KEY_SETUP.md      # Multiple API keys guide
│   ├── TESTING.md              # Testing guide
│   └── CHANGES_SUMMARY.md      # Recent changes
└── vercel.json            # Vercel deployment config
```

## Documentation

Comprehensive guides are available in the [`docs/`](./docs) folder:

- **[docs/SEARCH_SETUP.md](./docs/SEARCH_SETUP.md)** - Setting up Serper.dev for production
- **[docs/MULTI_KEY_SETUP.md](./docs/MULTI_KEY_SETUP.md)** - Using multiple API keys for scale
- **[docs/TESTING.md](./docs/TESTING.md)** - Complete testing guide
- **[docs/CHANGES_SUMMARY.md](./docs/CHANGES_SUMMARY.md)** - Summary of recent changes

## Testing

Test scripts are available in the [`scripts/`](./scripts) folder:

```bash
# Main integration test - tests your complete search system
node scripts/test-search-system.mjs

# Test individual Serper API keys
node scripts/test-serper.js

# Test SearXNG instances (educational)
node scripts/test-searxng.js
```

See [docs/TESTING.md](./docs/TESTING.md) for detailed testing instructions.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT

## Support

For questions or issues, please open a GitHub issue.
