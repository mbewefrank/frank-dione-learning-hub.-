# Frank Dione Learning Hub

Frank Dione Learning Hub is an online learning platform for students to access educational resources, manage their profiles, and eventually subscribe to premium learning content.

## Current Features

- Student account registration
- Student login
- Email authentication through Supabase
- Student dashboard
- Student profile
- Learning-resource library
- Private document storage
- Signed document URLs
- Free and premium resource structure
- Subscription database structure

## Project Files

- `index.html` — Main landing page and authentication interface
- `style.css` — Website styling
- `config.js` — Supabase browser configuration
- `app.js` — Registration and login functionality
- `dashboard.html` — Student dashboard
- `dashboard.js` — Dashboard functionality
- `supabase-schema.sql` — Database and storage setup
- `.gitignore` — Prevents local secrets from being committed

## Supabase Setup

Open the Supabase project connected to this website.

Go to:

**SQL Editor → New query**

Copy the complete contents of:

`supabase-schema.sql`

into the SQL Editor and run it.

This creates:

- `profiles`
- `documents`
- `subscriptions`

It also enables Row Level Security and creates the required authentication and storage setup.

## Storage

The SQL creates a private storage bucket called:

`learning-documents`

Learning documents can be uploaded from:

**Supabase → Storage → learning-documents**

The document path stored in the `documents` table must match the file's storage path.

## Authentication

In Supabase:

**Authentication → URL Configuration**

After the website has been deployed to Vercel, add the deployed website URL to the appropriate authentication URL settings.

If email confirmation is enabled, users must confirm their email before they can sign in.

## Vercel Deployment

The project is a static HTML/CSS/JavaScript website.

When importing the GitHub repository into Vercel:

- Framework preset: `Other`
- Build command: leave empty
- Output directory: leave empty
- Root directory: `/`

Vercel will deploy the files directly.

## Security

The browser uses the Supabase publishable key.

Never place a Supabase service-role or secret key inside:

- `index.html`
- `app.js`
- `dashboard.js`
- `config.js`

The publishable key is designed to be used by the frontend together with Row Level Security.

## Premium Subscriptions

The database already contains a subscription structure, but payment processing is not yet connected.

Mobile Money payments should eventually be verified on the server side through the appropriate payment provider.

The frontend must never be trusted to decide that a payment was successful.

## Important Note About Documents

Private storage and signed URLs reduce unauthorized access, but a website cannot guarantee that a user will never copy or redistribute a document after viewing it.

A stronger production version should move premium document authorization to a server-side function that verifies the user's active subscription before issuing a signed URL.

## Development Workflow

1. Edit files in GitHub.
2. Commit changes to the `main` branch.
3. Vercel automatically detects the new commit.
4. Vercel creates a new deployment.
5. Test the deployed website.
