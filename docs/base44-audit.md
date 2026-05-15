# Base44 Audit

## Overview

The current MindBloom repository is a Base44-generated React/Vite application. The runtime is tightly coupled to Base44 across routing, authentication, data access, AI calls, build configuration, and environment handling.

The existing app is not a Next.js app. It currently depends on:

- Vite for build and local development
- React Router for routing
- Base44 SDK for auth and runtime APIs
- Base44 virtual modules for entities and integrations
- Client-side LLM and image generation calls
- Client-side persistence of Base44 access tokens and app metadata

## Base44-Specific Dependencies And Replacements

| Base44 surface | Where found | Current role | Recommended replacement |
| --- | --- | --- | --- |
| `@base44/sdk` | `package.json`, `src/api/base44Client.js`, `src/lib/AuthContext.jsx` | Base44 client creation, auth APIs, low-level axios helper | Replace with `@clerk/nextjs` for auth and `@supabase/supabase-js` plus `@supabase/ssr` for data access |
| `@base44/vite-plugin` | `package.json`, `vite.config.js` | Injects Base44 runtime behavior, legacy virtual imports, builder hooks | Remove entirely and replace with native Next.js 14 App Router configuration |
| `src/api/base44Client.js` | `src/api/base44Client.js` | Central Base44 client wrapper | Replace with `lib/supabase.ts` and Clerk server/client helpers |
| `src/lib/AuthContext.jsx` | `src/lib/AuthContext.jsx` | Base44 auth bootstrap, app public settings fetch, redirect logic | Replace with Clerk middleware, `auth()` on the server, and Clerk components/hooks |
| `src/lib/app-params.js` | `src/lib/app-params.js` | Reads Base44 app ID, token, functions version, and app base URL from query params/local storage | Remove entirely; use standard environment variables and Clerk session cookies |
| `@/entities/User` | Imported in `src/Layout.jsx`, `src/pages/Create.jsx`, `src/pages/Library.jsx`, `src/pages/Reader.jsx`, `src/components/settings/UserSettingsModal.jsx` | User profile fetch, logout, user settings update | Replace with Clerk user/session APIs plus a Supabase `profiles` table |
| `@/entities/Book` | Imported in `src/pages/Create.jsx`, `src/pages/Dashboard.jsx`, `src/pages/Editor.jsx`, `src/pages/Library.jsx`, `src/pages/Reader.jsx`, `src/components/reader/ReaderShareModal.jsx` | Private story CRUD | Replace with Supabase `stories` table and typed helpers in `lib/supabase.ts` |
| `@/entities/PublicBook` | Imported in `src/pages/Editor.jsx`, `src/pages/Library.jsx`, `src/pages/Reader.jsx`, `src/components/reader/ReaderShareModal.jsx` | Public share copy of a private story | Replace with a single `stories` table using `is_public` and RLS policies |
| `@/integrations/Core` `InvokeLLM` | `src/pages/Create.jsx`, `src/pages/Editor.jsx` | Story outline and story generation | Replace with `groq-sdk` wrapped in `lib/groq.ts` and server-side API routes |
| `@/integrations/Core` `GenerateImage` | `src/pages/Create.jsx`, `src/pages/Editor.jsx`, `src/components/editor/CoverEditor.jsx`, `src/components/editor/PageEditor.jsx` | Page illustration and cover image generation | No direct equivalent in the requested stack. For the rebuild, keep `cover_image_url` optional and, if image generation is later restored, route it through a dedicated server-only provider and store assets in Supabase Storage |
| `base44.appLogs.logUserInApp` | `src/lib/NavigationTracker.jsx` | Base44 telemetry/logging | Replace with Vercel analytics or remove if not required |
| Base44 public settings endpoint | `src/lib/AuthContext.jsx` | Determines whether auth is required and whether a user is registered | Replace with Clerk route protection and application-level onboarding logic |
| Base44 environment variables | `src/lib/app-params.js`, `README.md` | App bootstrap configuration | Replace with Clerk, Supabase, and Groq environment variables |
| Base44 branding in static shell | `index.html`, `README.md`, `package.json` | Generated project naming/branding | Replace with MindBloom branding and Next.js project metadata |
| Auto-generated `pages.config.js` | `src/pages.config.js` | Base44 page registry | Replace with filesystem routing in Next.js App Router |

## Routes And Page Components

### Current route registry

The app uses `react-router-dom` plus generated `pages.config.js` instead of filesystem routing.

Declared routes:

- `/` -> `Landing` via `mainPage: "Landing"`
- `/Create` -> `src/pages/Create.jsx`
- `/Dashboard` -> `src/pages/Dashboard.jsx`
- `/Editor` -> `src/pages/Editor.jsx`
- `/Landing` -> `src/pages/Landing.jsx`
- `/Library` -> `src/pages/Library.jsx`
- `/Reader` -> `src/pages/Reader.jsx`
- `*` -> `src/lib/PageNotFound.jsx`

### Shared layout/runtime wrappers

- `src/App.jsx`
  - React Router setup
  - Base44 auth gating through `AuthProvider`
  - Query client provider
  - Global navigation tracker
- `src/Layout.jsx`
  - Shared sidebar layout
  - User fetch via Base44 `User.me()`
  - User logout via Base44 `User.logout()`
  - Hides layout on `Landing` and `Reader`

### Route behavior summary

- `src/pages/Landing.jsx`
  - Public marketing-like landing page
  - Checks auth with Base44 and routes authenticated users toward dashboard
- `src/pages/Dashboard.jsx`
  - Auth-protected dashboard
  - Loads recent books and summary counts
- `src/pages/Create.jsx`
  - Auth-protected story creation flow
  - Client-side outline generation, full story generation, image generation, and record creation
- `src/pages/Library.jsx`
  - Auth-protected story listing, search, filters, and public/private toggle
- `src/pages/Editor.jsx`
  - Auth-protected story editor with save, regenerate, reorder, export, and public sharing sync
- `src/pages/Reader.jsx`
  - Mixed public/private reader
  - Reads either `Book` or `PublicBook` based on query params

## Data Models And Database Interactions

The Base44 data layer is abstracted behind generated virtual entities, but the application code exposes the effective shape.

### `Book` entity

Inferred fields from reads/writes:

- `id`
- `title`
- `idea`
- `age_group`
- `focus_topic`
- `page_length`
- `illustration_style`
- `print_format`
- `author_name`
- `story_outline`
- `pages` as an array of objects with:
  - `page_number`
  - `text`
  - `illustration_prompt`
  - `illustration_url`
- `character_description`
- `status`
- `cover_image_url`
- `is_public`
- `public_book_id`
- `created_by`
- `created_date`
- `updated_date`

Observed operations:

- `Book.create(bookData)` in `src/pages/Create.jsx`
- `Book.list("-created_date", limit?)` in `src/pages/Dashboard.jsx` and `src/pages/Library.jsx`
- `Book.filter({ id })` in `src/pages/Editor.jsx` and `src/pages/Reader.jsx`
- `Book.update(id, data)` in `src/pages/Editor.jsx`, `src/pages/Library.jsx`, and `src/components/reader/ReaderShareModal.jsx`

### `PublicBook` entity

Purpose:

- Maintains a duplicated public copy of a private story for shareable links

Observed operations:

- `PublicBook.create(data)` in `src/pages/Editor.jsx`, `src/pages/Library.jsx`, `src/components/reader/ReaderShareModal.jsx`
- `PublicBook.update(id, data)` in `src/pages/Editor.jsx`
- `PublicBook.delete(id)` in `src/pages/Editor.jsx`, `src/pages/Library.jsx`, `src/components/reader/ReaderShareModal.jsx`
- `PublicBook.filter({ id })` in `src/pages/Reader.jsx`

Recommended replacement:

- Collapse `Book` and `PublicBook` into one `stories` table with an `is_public` flag and RLS allowing public reads where `is_public = true`

### `User` entity

Inferred fields from usage:

- `id`
- `full_name`
- `email`
- `avatar_url`
- `created_date`
- `settings`
- `preferred_name`
- `bio`

Observed operations:

- `User.me()` in `src/Layout.jsx`, `src/pages/Create.jsx`, `src/pages/Library.jsx`, `src/pages/Reader.jsx`, `src/components/settings/UserSettingsModal.jsx`
- `User.logout()` in `src/Layout.jsx`
- `UserEntity.updateMyUserData(...)` in `src/components/settings/UserSettingsModal.jsx`

Recommended replacement:

- Use Clerk for identity and session state
- Mirror app-specific profile fields in Supabase `profiles`

## AI/API Integrations And Prompt Logic

### LLM generation

Primary files:

- `src/pages/Create.jsx`
- `src/pages/Editor.jsx`

Current behavior:

1. Generate a story outline with `InvokeLLM`
2. Generate full page-by-page story content with `InvokeLLM`
3. Generate page images sequentially with `GenerateImage`
4. Generate a cover image with `GenerateImage`
5. Save the assembled story client-side to the `Book` entity

#### Outline prompt shape

The outline prompt requests:

- 2-3 sentence story summary
- main characters with descriptions
- key lessons/messages
- per-page structure for a user-selected page count
- age-appropriate, educational content tied to a focus topic

It expects structured JSON with:

- `summary`
- `characters`
- `lessons`
- `pages[]`

#### Full story prompt shape

The full story prompt requests:

- page-by-page story text
- detailed illustration prompt per page
- character consistency
- educational elements tied to the focus topic
- pacing based on page length

It expects structured JSON with:

- `pages[]`
  - `page_number`
  - `text`
  - `illustration_prompt`
- `character_description`

#### Image generation prompts

Page image prompt pattern:

- `${page.illustration_prompt}, ${character_description}, ${illustration_style} style`

Cover image prompt pattern:

- `Children's book cover for "{title}". Style: {illustration_style}. Featuring: {character_description}. Theme: {focus_topic}. Mood is bright, cheerful, and welcoming for ages {age_group}.`

### Architectural concerns in current AI flow

- All prompt construction happens client-side
- No server-only secret boundary is visible in the app code
- No streaming UX for story text generation
- Story generation and persistence are tightly coupled to the page component
- Current rebuild target intentionally replaces this with server-side Groq access and a streaming API route

## Auth Flows

### Base44 auth bootstrap

Primary files:

- `src/lib/AuthContext.jsx`
- `src/api/base44Client.js`
- `src/lib/app-params.js`

Current auth flow:

1. Read Base44 app ID and token from query params/local storage
2. Fetch Base44 app public settings from `/api/apps/public/prod/public-settings/by-id/{appId}`
3. If a token exists, call `base44.auth.me()` to validate user session
4. Expose auth state through custom React context
5. Redirect unauthenticated users with `base44.auth.redirectToLogin(...)`

### Route-level auth checks

Base44 auth checks are duplicated inside route components:

- `Landing` checks whether the user is already authenticated
- `Dashboard`, `Create`, `Editor`, and `Library` check `base44.auth.isAuthenticated()` and redirect on failure
- `Reader` allows unauthenticated access only when `public=true`

### Logout and account operations

- Logout in `Layout.jsx` via `User.logout()`
- Logout in settings modal via `base44.auth.logout(...)`
- Settings updates through `UserEntity.updateMyUserData(...)`

### Recommended replacement

- Replace the entire auth stack with Clerk middleware and Clerk UI routes
- Use `auth()` in server code and `useUser()` only where client state is required
- Store app-specific user profile data in Supabase `profiles`

## Migration Notes For The New Stack

### Direct replacements that fit the requested rebuild

- Routing: Next.js App Router instead of React Router and `pages.config.js`
- Auth: Clerk instead of Base44 auth context and redirect helpers
- Data: Supabase `stories`, `profiles`, `story_likes` instead of `Book`, `PublicBook`, and Base44 user storage
- AI: `groq-sdk` in server-only route handlers instead of `InvokeLLM`
- Sharing: single `stories` table with `is_public` instead of copying records into `PublicBook`
- Telemetry: remove `base44.appLogs` or replace later with Vercel analytics

### Functionality that exists today but is outside the requested stack

The current Base44 app includes several features not explicitly requested in the rebuild scope:

- AI image generation for page illustrations and covers
- Rich page-by-page editor and page reordering
- PDF/Word export flows
- Detailed user settings/preferences UI

These should either be deferred or reintroduced later behind explicit service integrations instead of relying on Base44 virtual modules.
