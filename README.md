# FormLens

**Application & Deadline Readiness Manager**

FormLens is a personal application-readiness and deadline-management web application. It helps you track what you need to complete before submitting applications — university admissions, scholarships, jobs, visas, certifications, and more.

---

## The Core Idea

> "What do I still need to complete before I can submit this application?"

FormLens answers this through its **Readiness Check** — a real-time view of how many of your required documents, forms, and tasks are complete.

---

## Main Features

- **Application management** — Create, edit, archive, and search applications across multiple categories
- **Requirement tracking** — Add requirements (required or optional), mark them complete, track progress
- **Readiness system** — See exactly what percentage ready you are and what's still missing
- **Deadline monitoring** — Track deadlines with status indicators (Normal → Approaching → Urgent → Expired)
- **Document info tracking** — Record document metadata (issue date, expiry date) without storing actual files
- **Email reminders** — Receive scheduled reminders 30, 14, 7, 3, or 1 day before a deadline
- **Guest mode** — Use the full app without an account; data stored in browser localStorage
- **Cloud sync** — Create an account to persist data across devices and receive email reminders
- **Guest → Account migration** — Seamlessly import existing local data when creating an account

---

## Guest Mode vs. Registered Mode

| Feature | Guest | Registered |
|---|---|---|
| Create applications | ✓ | ✓ |
| Track requirements | ✓ | ✓ |
| Check readiness | ✓ | ✓ |
| Record document info | ✓ | ✓ |
| Data persists across sessions | ✓ (this browser only) | ✓ (cloud) |
| Cross-device access | ✗ | ✓ |
| Email reminders | ✗ | ✓ |
| Profile management | ✗ | ✓ |

**Guest data** is stored in `localStorage`. Clearing browser data or using another device will lose access to it. A prompt to create an account is available but never intrusive.

---

## Architecture

```
Browser (Vercel)
      │
      ▼
Express API (Render)
      │
   ┌──┴──────────┐
   │             │
Supabase Auth  PostgreSQL (Supabase)
                   │
               Prisma ORM
                   │
         Application Data

         +
    Email Service (Resend)
         │
      User Email
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (Supabase-hosted) |
| ORM | Prisma 6.x |
| Authentication | Supabase Auth |
| Email | Resend (abstracted — swappable via env var) |
| Toasts | Sonner |
| Frontend hosting | Vercel |
| Backend hosting | Render |

---

## Environment Variables

Copy `.env.example` to `backend/.env` and fill in your values.

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase connection pooler URL (for Prisma runtime) |
| `DIRECT_URL` | Supabase direct URL (for Prisma migrations) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only.** Never expose to frontend |
| `EMAIL_PROVIDER` | `resend` \| `sendgrid` \| `smtp` |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Sender address (e.g. `FormLens <noreply@yourdomain.com>`) |
| `FRONTEND_URL` | Your Vercel frontend URL (for CORS) |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (Render sets automatically) |

> **Frontend config:** Create `frontend/env.js` based on `frontend/env.example.js`. This file is gitignored. On Vercel, use environment variable injection or a build step.

---

## Local Setup

### Prerequisites

- Node.js 20+
- A Supabase project (free tier works)
- A Resend account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/formlens.git
cd formlens
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Copy and configure environment variables:

```bash
cp ../.env.example .env
# Edit .env with your Supabase, Resend, and other credentials
```

### 3. Set up the database

```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations (development)
```

### 4. Start the backend

```bash
npm run dev            # Development (node --watch)
npm start              # Production
```

### 5. Set up the frontend

```bash
cp frontend/env.example.js frontend/env.js
# Edit frontend/env.js with your Supabase and API URL
```

Open `frontend/index.html` directly in a browser, or use a local static server:

```bash
npx serve frontend
```

---

## Prisma Commands

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create and run a new migration
npm run db:migrate

# Push schema changes without migration (prototyping only)
npm run db:push

# Open Prisma Studio (database browser)
npm run db:studio
```

---

## API Overview

All API routes are under `/api`. Protected routes require `Authorization: Bearer <supabase-jwt>`.

```
POST   /api/auth/register
POST   /api/auth/profile-sync

GET    /api/profile
PATCH  /api/profile
POST   /api/profile/change-password

GET    /api/applications
POST   /api/applications
GET    /api/applications/:id
PATCH  /api/applications/:id
DELETE /api/applications/:id
GET    /api/applications/:id/readiness

GET    /api/applications/:id/requirements
POST   /api/applications/:id/requirements
PATCH  /api/requirements/:id
DELETE /api/requirements/:id

GET    /api/requirements/:id/document
PUT    /api/requirements/:id/document
DELETE /api/requirements/:id/document

GET    /api/applications/:id/reminders
POST   /api/applications/:id/reminders
DELETE /api/reminders/:id

POST   /api/migration/import
```

---

## Supabase Setup Notes

1. Create a new Supabase project
2. Go to **Settings → API** to get your `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
3. Go to **Settings → Database** to get your connection strings
4. Use the **pooler** connection string for `DATABASE_URL` (pgBouncer mode)
5. Use the **direct** connection string for `DIRECT_URL` (for migrations)
6. In **Authentication → URL Configuration**, add your Vercel URL to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/reset-password.html`

---

## Production Considerations (Render + Vercel)

### Backend (Render)

- Set all environment variables in the Render dashboard
- Set `NODE_ENV=production`
- Render will use `npm start` as the start command
- The reminder cron job runs inside the Express process — no separate worker needed for V1
- Set `PORT` is automatically provided by Render

### Frontend (Vercel)

- Deploy the `frontend/` directory
- Create `frontend/env.js` as part of your build or via Vercel edge config
- Alternatively, use Vercel environment variables + a build step that generates `env.js`
- Set the `FRONTEND_URL` on the backend to match your Vercel deployment URL

---

## Security Considerations

- **Authentication** is handled entirely by Supabase Auth — no custom password storage
- **JWT verification** happens server-side on every protected endpoint
- **Ownership validation** — every query is filtered by the authenticated user's profile ID, never by client-supplied IDs
- **Rate limiting** — strict limits on auth, password, and recovery endpoints (10 req/15 min)
- **Input validation** — Zod schemas validate all request bodies before database operations
- **CORS** — explicitly configured to allow only `FRONTEND_URL`
- **Helmet** — security headers applied globally
- **No secrets in logs** — passwords and tokens are redacted before logging
- **Production errors** — stack traces and internal error details are never returned to clients
- **Password change cooldown** — 30-minute server-enforced cooldown after a successful password change

---

## V1 Known Limitations

- No actual file storage (documents track metadata only)
- Email reminders require a registered account
- Reminder cron job runs inside the Express process — for high scale, move to a dedicated job runner
- No multi-device conflict resolution for guest mode
- No collaboration or sharing features
- No mobile app

---

## License

MIT
