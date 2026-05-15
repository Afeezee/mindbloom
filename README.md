# MindBloom

MindBloom is an AI-powered children's story writing web app rebuilt as a fully owned Next.js 14 application. Parents, teachers, and young readers can generate child-safe stories with Groq and Llama 3.3 70B, save them to Supabase, and revisit them through a polished story library.

## Screenshots

Add screenshots here after deployment:

- `docs/screenshots/dashboard.png`
- `docs/screenshots/new-story.png`
- `docs/screenshots/story-reader.png`

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 14 App Router with TypeScript |
| Styling | Tailwind CSS |
| Authentication | Clerk |
| Database | Supabase Postgres |
| Storage | Supabase Storage |
| AI engine | Groq SDK with `meta-llama/llama-3.3-70b-versatile` |
| Deployment | Vercel |

## Local Setup

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Fill in real values for Clerk, Supabase, and Groq.
5. Run the SQL migration in `supabase/migrations/001_initial_schema.sql`.
6. Run the seed script in `supabase/seed.sql` if you want sample stories.
7. Start the app with `npm run dev`.

### Environment Variables

Use the following keys in `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
```

### Supabase Notes

This repo includes RLS policies that expect a Clerk-backed JWT claim for the user id via `auth.jwt() ->> 'sub'` or `auth.jwt() ->> 'clerk_user_id'`.

To use direct browser reads with RLS, configure the Clerk to Supabase JWT integration or keep access inside server routes and server components.

## Folder Structure

```text
app/
	(auth)/
	(dashboard)/
	api/
	read/
components/
	layout/
	story/
	ui/
docs/
lib/
public/
supabase/
	migrations/
```

## Deployment

1. Create a new Vercel project and import this repository.
2. Add all environment variables from `.env.example` inside Vercel.
3. Create a Supabase project and run the migration and seed files.
4. Configure Clerk with the same sign-in and sign-up URLs used in `.env.local`.
5. Add your Groq API key from `console.groq.com`.
6. Deploy to Vercel.

## Contributing

1. Create a feature branch.
2. Keep changes typed and server-first.
3. Route all Supabase access through `lib/supabase.ts`.
4. Route all Groq access through `lib/groq.ts`.
5. Validate with `npm run dev`, `npm run typecheck`, and `npm run lint` before opening a pull request.

## License

MIT
