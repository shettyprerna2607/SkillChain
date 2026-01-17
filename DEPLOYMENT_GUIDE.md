# SkillChain Deployment Guide - Render.com

This guide details how to deploy your full-stack SkillChain application to Render.com for free (or low cost).

## Prerequisites

1.  A GitHub account with your `SkillChain` code pushed to a repository.
2.  A [Render.com](https://render.com) account (Sign up with GitHub).

---

## Part 1: Database (PostgreSQL)

Since SkillChain needs a database, we'll set this up first so we can get the connection URL.

1.  **Dashboard**: click **New +** -> **PostgreSQL**.
2.  **Name**: `skillchain-db`.
3.  **Region**: Choose the one closest to you (e.g., Singapore, Frankfurt).
4.  **Plan**: Select **Free**.
5.  **Create**: Click **Create Database**.
6.  **Copy URL**: Once created, find the **Internal DB URL** (starts with `postgres://...`) and keep it safe. You will need this for the Backend.

---

## Part 2: Backend (Spring Boot)

1.  **Dashboard**: Click **New +** -> **Web Service**.
2.  **Source Code**: valid "Build from existing repository" and select your `SkillChain` repo.
3.  **Basic Settings**:
    *   **Name**: `skillchain-api`
    *   **Root Directory**: `skillchain-backend` (Important!)
    *   **Environment**: `Docker`
    *   **Region**: Same as your database.
    *   **Plan**: Free
4.  **Environment Variables** (Click "Advanced" or "Environment"):
    Add the following keys and values:

    | Key | Value |
    | :--- | :--- |
    | `PORT` | `8080` |
    | `JDBC_DATABASE_URL` | Paste your **Internal DB URL** from Part 1 |
    | `JDBC_DATABASE_USERNAME` | `skillchain_db_user` (Found in DB settings) |
    | `JDBC_DATABASE_PASSWORD` | `...` (Found in DB settings) |
    | `JWT_SECRET` | Generate a long random string (e.g., use a password generator) |
    | `GEMINI_API_KEY` | Your Gemini API Key (`AIza...`) |
    | `FRONTEND_URL` | leave blank for now, come back and update after Part 3 |

5.  **Deploy**: Click **Create Web Service**.
    *   *Wait for the build to finish. It may take 5-10 minutes.*
    *   *Once live, copy the URL (e.g., `https://skillchain-api.onrender.com`).*

---

## Part 3: Frontend (React)

1.  **Dashboard**: Click **New +** -> **Static Site**.
2.  **Source Code**: Select your `SkillChain` repo again.
3.  **Basic Settings**:
    *   **Name**: `skillchain-web`
    *   **Root Directory**: `skillchain-frontend`
    *   **Build Command**: `npm install && npm run build`
    *   **Publish Directory**: `build`
4.  **Environment Variables**:

    | Key | Value |
    | :--- | :--- |
    | `REACT_APP_API_URL` | `https://skillchain-api.onrender.com/api` (Your Backend URL + /api) |
    | `REACT_APP_WS_URL` | `https://skillchain-api.onrender.com/ws` (Your Backend URL + /ws) |

5.  **Deploy**: Click **Create Static Site**.
    *   *Once live, copy the URL (e.g., `https://skillchain-web.onrender.com`).*

---

## Part 4: Final Connection

1.  Go back to your **Backend Service** (`skillchain-api`) on Render.
2.  Go to **Environment**.
3.  Add/Update the `FRONTEND_URL` variable with your **Frontend URL** from Part 3 (e.g., `https://skillchain-web.onrender.com`).
4.  **Save Changes**: Render will automatically redeploy the backend to apply the security update.

## 🎉 Done!
Your application is updated and live!
