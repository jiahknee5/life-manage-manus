# Life Manage App - Deployment Guide

## Overview
This document provides instructions for deploying the Life Manage application. The application is built with Next.js and uses Supabase for authentication, database, and storage.

## Prerequisites
- Vercel account for hosting the Next.js application
- Supabase account for backend services
- OpenAI API key for AI features

## Supabase Setup

1. Create a new Supabase project
2. Set up the database schema using the SQL in `/database/schema.sql`
3. Configure authentication with email/password sign-up
4. Note your Supabase URL and anon key for the next steps

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For production deployment on Vercel, add these environment variables in the Vercel project settings.

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Production Deployment

### Deploying to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Connect your repository to Vercel:
   - Create a new project in Vercel
   - Import your repository
   - Configure the project settings
   - Add the environment variables
   - Deploy

3. Vercel will automatically build and deploy your application

### Manual Deployment

If you prefer to deploy manually:

1. Build the application:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

## Post-Deployment Steps

1. Create an admin user through the sign-up process
2. Test all features with real data
3. Set up proper security rules in Supabase if needed

## Troubleshooting

- If authentication issues occur, check your Supabase configuration
- For OpenAI API issues, verify the API key is correctly entered by users
- For database issues, check the Supabase console for errors

## Maintenance

- Regularly update dependencies for security patches
- Monitor Supabase usage and upgrade plan if necessary
- Keep track of OpenAI API usage costs
