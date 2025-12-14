# Deployment Guide (Vercel + Postgres)

Your application is now configured for a professional cloud deployment using **Vercel** and **PostgreSQL**.

## Prerequisites
1.  **GitHub Account**: To store your code.
2.  **Vercel Account**: To host the website (sign up with GitHub).
3.  **Resend Key**: You already have this!

## Step 1: Push Code to GitHub
Since you are currently working in a playground environment, you need to get this code to your own GitHub.

1.  Create a **new empty repository** on GitHub (e.g., named `islamic-education-platform`).
2.  Run the following commands in your terminal (locally) or follow the "Push an existing repository" instructions GitHub gives you.
    *(Note: If you downloaded this code, you will need to initialize git first)*

## Step 2: Deploy to Vercel
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `islamic-education-platform` repository.
4.  **Environment Variables**:
    In the deployment configuration, expand "Environment Variables" and add:
    - `RESEND_API_KEY`: `re_X1bJN3Sa_GMXpcbgQCqoRx26Rfv1Wwr8W`
    - `DATABASE_URL`: *(Leave empty for now, see Step 3)*

5.  Click **Deploy**. (It might fail initially because of the database, that's normal).

## Step 3: Connect Database (Postgres)
1.  In your Vercel Project Dashboard, click on the **Storage** tab.
2.  Click **"Connect Store"** -> **"Create New"** -> **"Postgres"**.
3.  Accept the terms and create the database (select a region near you).
4.  Once created, Vercel will automatically add the `DATABASE_URL` , `POSTGRES_URL` etc., environment variables to your project.
5.  Go to the **Deployments** tab, find the failed deployment (or latest one), click the three dots button, and select **"Redeploy"**.

## Step 4: Initialize Database
Vercel handles the connection, but we need to create the tables (Booking, etc.).
1.  You can use the Vercel Dashboard "Data" tab to run SQL, or easier:
2.  Connect your local terminal to Vercel (if you have Vercel CLI) OR simply rely on the fact that for this prototype, we might need a way to run migrations.
    *Actually, for Vercel, the easiest way for you right now is:*
    - In Vercel Project Settings > Build & Development settings.
    - Change **Build Command** to: `npx prisma generate && npx prisma db push && next build`
    - Redeploy. This will ensure the database tables are created every time you deploy.

## Done!
Your URL (e.g., `islamic-education-platform.vercel.app`) is now live.
