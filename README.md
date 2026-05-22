# Job Application Tracker

A full-stack web application to manage and track job applications. Built for the SWE40006 coursework project.

## Tech Stack

- **Frontend/Backend:** [Next.js](https://nextjs.org) (React + TypeScript)
- **Database & Auth:** [Supabase](https://supabase.com)
- **Deployment:** [Vercel](https://vercel.com)
- **CI/CD:** GitHub Actions
- **Testing:** Jest + React Testing Library
- **Styling:** Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables by creating a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

3. Set up the database by running the schema SQL file:
   - Open your Supabase project's SQL editor
   - Copy the contents of `supabase/schema.sql` and execute it
   - This will create the `applications` table with RLS policies

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Build & Deploy

Build for production:

```bash
npm run build
npm start
```

The easiest way to deploy is via [Vercel](https://vercel.com/new?filter=next.js&utm_source=github&utm_campaign=next-example). See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Planned Features

- [ ] User login/authentication
- [ ] View applications
- [ ] Add new application
- [ ] Edit application details
- [ ] Delete application

## Development Branches

- `feature/ui-pages` - UI and page layouts
- `feature/supabase-crud` - Database CRUD operations
- `feature/testing-ci` - Testing and CI pipeline
- `feature/deployment` - Deployment configuration

## Documentation

- [Database Schema](docs/database.md) - Application table structure and RLS policies
