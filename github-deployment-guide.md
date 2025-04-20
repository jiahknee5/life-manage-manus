# Life Manage - Deployment Guide

This guide will walk you through the process of deploying the Life Manage application using GitHub and Vercel.

## Prerequisites

Before you begin, make sure you have:

1. A GitHub account
2. A Vercel account (you can sign up at https://vercel.com/signup using your GitHub account)
3. A Supabase account and project (you already have this set up)

## Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Name your repository (e.g., "life-manage")
3. Choose public or private visibility
4. Click "Create repository"
5. Note the repository URL (e.g., https://github.com/yourusername/life-manage.git)

## Step 2: Push the Code to GitHub

Run the following commands in your terminal after extracting the zip file:

```bash
# Navigate to the project directory
cd path/to/life-manage

# Initialize Git repository
git init

# Set the main branch name
git branch -M main

# Add all files to Git
git add .

# Commit the files
git commit -m "Initial commit"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/life-manage.git

# Push the code to GitHub
git push -u origin main
```

Replace `https://github.com/yourusername/life-manage.git` with your actual repository URL.

## Step 3: Deploy with Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: (leave as default)
   - Output Directory: (leave as default)
   - Environment Variables:
     - NEXT_PUBLIC_SUPABASE_URL: https://sslkcdtmihvqnzhdbxyz.supabase.co
     - NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbGtjZHRtaWh2cW56aGRieHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNDk4MjgsImV4cCI6MjA2MDcyNTgyOH0.UkSGWpwIJETJDDVcFMedtTqmGoedWaBmi9rWYYNjgls
4. Click "Deploy"

## Step 4: Set Up Supabase Database

1. Go to your Supabase project: https://app.supabase.io/project/sslkcdtmihvqnzhdbxyz
2. Go to the SQL Editor
3. Copy and paste the contents of the database/schema.sql file
4. Run the SQL to create all the necessary tables and security policies

## Step 5: Access Your Deployed Application

Once deployment is complete, Vercel will provide you with a URL to access your application. This URL is the permanent address of your application.

## Updating Your Application

To update your application in the future:

1. Make changes to your local code
2. Commit the changes: `git add . && git commit -m "Your update message"`
3. Push to GitHub: `git push origin main`
4. Vercel will automatically deploy the updates

## Troubleshooting

If you encounter any issues during deployment:

1. Check the Vercel deployment logs for errors
2. Verify that your environment variables are correctly set
3. Ensure your Supabase project is properly configured
4. Check that your GitHub repository contains all the necessary files

For more help, refer to the Vercel documentation: https://vercel.com/docs
