# MindBloom — GitHub Copilot Instructions

## Project Overview
MindBloom is an AI-powered children's story writing web app. Users input a 
theme, age group, character name, and setting; Llama 3.3 70B (via Groq) 
streams back a beautifully written, age-appropriate story which they can 
save, read, and share.

## Stack
- Next.js 14 App Router (TypeScript, strict mode)
- Tailwind CSS (playful, child-friendly design: purples, teals, warm yellows)
- Clerk (authentication)
- Supabase (Postgres database + Row Level Security)
- Groq SDK (groq-sdk) — model: meta-llama/llama-3.3-70b-versatile, streaming
- Vercel (deployment)

## Key Conventions
- Server components by default; "use client" only when state/events are needed
- All Supabase calls go through /lib/supabase.ts helper functions only
- All Groq/LLM calls go through /lib/groq.ts wrapper only — never call the 
  Groq SDK directly from components or pages
- Types live exclusively in /lib/types.ts
- ALL AI outputs must pass through child-safety content constraints defined 
  in the system prompt inside /lib/groq.ts — never bypass or weaken this
- Use Zod for all API route input validation
- Tailwind only for styling — no CSS modules, no styled-components
- API routes use default Node.js runtime (not Edge) for Groq SDK compatibility

## Architecture Notes
- Story generation is streaming: /api/generate-story returns a plain text 
  ReadableStream. The client reads it via response.body.getReader()
- Groq streaming uses async iterable: groq.chat.completions.create({stream:true})
  which must be converted to a Web API ReadableStream in the route handler
- Auth is Clerk-based: use auth() (server) and useUser() (client) from @clerk/nextjs
- RLS on Supabase means users only ever access their own stories via anon key
- Service role key is used only in server-only contexts (API routes, server actions)
- GROQ_API_KEY is a server-only secret — never expose it to the client

## File Structure
/app — Next.js App Router pages and API routes  
/components/ui — generic UI primitives  
/components/story — story-specific components  
/components/layout — Navbar, Footer  
/lib — supabase.ts, groq.ts, types.ts, utils.ts  
/supabase — SQL migrations and seed files  
/docs — audit notes, architecture decisions  
/.github — this file  
