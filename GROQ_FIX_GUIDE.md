# MindBloom Groq API Configuration - Fix Guide

## Problem
The story generation is failing with a 404 error from Groq API. This means the `GROQ_API_KEY` environment variable is either:
- Not set in your Vercel deployment
- Invalid or expired
- Incorrectly formatted

## Solution Steps

### Step 1: Verify Your Groq API Key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign in to your Groq account
3. Navigate to **API Keys** section
4. Copy your active API key (starts with `gsk_`)
5. Verify it's not expired

### Step 2: Add to Vercel Environment Variables
1. Go to your Vercel project: https://vercel.com/dashboard
2. Find your **mindbloom-smoky** project
3. Click **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `GROQ_API_KEY`
   - **Value**: Paste your Groq API key (e.g., `gsk_...`)
   - **Environments**: Select **Production** (and Development if testing locally)
5. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the three dots (...) on the latest failed deployment
3. Select **Redeploy**
4. Wait for the deployment to complete

### Step 4: Test Locally (Optional)
If you want to test locally before redeploying:

1. Create `.env.local` in your project root
2. Add:
   ```bash
   GROQ_API_KEY=gsk_your_actual_key_here
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
3. Run `npm run dev`
4. Test story generation at http://localhost:3000/stories/new

## Improvements Made
✅ Better error logging in Groq wrapper
✅ Detailed error messages shown to users (no more vague "Streaming paused")
✅ Error stack traces visible in Vercel logs for debugging
✅ Improved stream error handling

## Common Issues

### "GROQ_API_KEY is not configured"
- The environment variable is missing
- Follow **Step 2** above to add it to Vercel

### 404 from Groq API
- Your API key is invalid or expired
- Get a new key from https://console.groq.com
- The model name `meta-llama/llama-3.3-70b-versatile` is correct

### Still seeing "Streaming paused" after fix?
- Wait for Vercel redeploy to finish
- Hard refresh your browser (Ctrl+Shift+R)
- Check Vercel logs in Production to see the actual error

## Vercel Logs Reference
When troubleshooting, check these:
1. Go to Vercel Dashboard → mindbloom-smoky → Logs
2. Look for POST `/api/generate-story` requests
3. Click on a failed request to see:
   - Error message from Groq
   - External API response codes
   - Full error stack trace (only in Production tab)
