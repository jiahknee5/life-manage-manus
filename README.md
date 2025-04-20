# Life Manage - README

## Overview

Life Manage is a web application that helps users organize their ChatGPT conversations into actionable projects. The application allows users to upload their ChatGPT history, automatically categorize conversations into projects, generate next steps using AI, and manage their projects through an intuitive interface.

## Features

- **User Authentication**: Secure sign-up and login using Supabase Auth
- **ChatGPT History Upload**: Upload and parse .json exports from ChatGPT
- **Automatic Project Categorization**: AI-powered categorization of conversations into work or personal projects
- **AI-Powered Next Steps**: Generate actionable tasks for each project
- **Homepage Executive Summary**: Personalized dashboard with project overview and priorities
- **Project Management Interface**: View and manage all projects, conversations, and tasks

## Tech Stack

- **Frontend**: Next.js with TypeScript and TailwindCSS
- **Backend**: Supabase (Authentication, PostgreSQL Database, Storage)
- **AI Integration**: OpenAI API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Set up the database schema using the SQL in `/database/schema.sql`
5. Run the development server:
   ```
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

See the [Deployment Guide](./deployment-guide.md) for detailed instructions on deploying the application to production.

## Project Structure

```
life-manage/
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── api/              # API routes
│   │   ├── categorize/       # Project categorization page
│   │   ├── dashboard/        # Dashboard page
│   │   ├── login/            # Login page
│   │   ├── next-steps/       # AI next steps page
│   │   ├── projects/         # Projects listing and detail pages
│   │   ├── upload/           # ChatGPT history upload page
│   │   ├── layout.tsx        # Root layout component
│   │   └── page.tsx          # Home page
│   ├── components/           # Reusable UI components
│   │   ├── auth/             # Authentication components
│   │   ├── conversations/    # Conversation components
│   │   ├── layout/           # Layout components
│   │   ├── projects/         # Project components
│   │   ├── tasks/            # Task components
│   │   └── upload/           # Upload components
│   └── lib/                  # Utility functions and services
│       ├── auth-context.tsx  # Authentication context provider
│       ├── database.ts       # Database service
│       └── supabase.ts       # Supabase client
├── database/                 # Database schema and migrations
├── public/                   # Static assets
├── deployment-guide.md       # Deployment instructions
├── test-report.md            # Testing documentation
└── todo.md                   # Development checklist
```

## Testing

The application includes a test data loader that can be used to populate the database with sample projects, tasks, conversations, and notes for testing purposes. See the [Test Report](./test-report.md) for details on the testing performed.

## Future Enhancements

- Apple Calendar Integration
- Admin Tools / Debug Mode
- Walkthrough for New Users
- Real-time sync with ChatGPT via API

## License

This project is licensed under the MIT License.
