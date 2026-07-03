# AdraConnects

**A**gile **D**evelopment, **R**obust **A**utomations — a WhatsApp-style **college club management & communication** web app, fully cloud-based. Direct messages, club group chats, admin-only announcements, event scheduling with RSVPs, and file/resource sharing, all updating in realtime.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite (plain JavaScript), react-router, date-fns |
| Backend | **Supabase cloud** — Postgres, Auth, Realtime, Storage (no custom server, no local data) |
| Realtime | `postgres_changes` for messages/read-receipts, Presence for online status, Broadcast for typing |

## Features

- **Auth** — **Google sign-in only** (email/password is disabled in Supabase Auth). Accounts and profiles are auto-created on first Google sign-in by a DB trigger; colored-initials avatar
- **Clubs** — create a club (you become admin), browse & join clubs, member list with roles, remove members (admin), leave club
- **Group chat** — realtime messaging per club with sender names and date separators
- **Direct messages** — 1:1 chats with online status, typing indicator, and WhatsApp-style ✓✓ read receipts that turn blue live
- **Announcements** — every club gets a 📢 channel; only admins can post (enforced by Row Level Security in the database, not just the UI)
- **Events** — admins schedule events (title, date/time, location, details); members RSVP Going/Maybe/Can't with live counts; upcoming & past sections. **RSVPs are permanent**: one response per member, locked at the database level (no updates or deletes) — a real commitment, not a poll
- **Attendance** — every event shows who will be present (RSVP names); faculty (or the club admin) mark actual attendance per member, and everyone sees the "X of Y present" summary
- **Faculty & admin panel** — teachers/HODs are stored in an `employees` table. New teachers register through the **Faculty Gateway** (`/faculty`): sign in with Google, then enter a staff access code — or get promoted by an HOD. Employees get a shield button opening `/admin`: overview stats, all students with club memberships (removable), all clubs with member management, all events with attendance marking, and faculty management (HOD-only: promote/demote/remove). Private chats and DMs stay invisible to the admin panel by design.
- **Resources** — attach 📎 images/files in any chat (stored in Supabase Storage); images render inline; every club has a Resources tab listing all shared files
- **Unread badges** — per-chat unread counts computed server-side in one RPC call

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173. To test realtime with two users, open a second window in incognito and sign in with a different Google account.

**Google OAuth setup (required — email sign-in is disabled):**

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) create an OAuth 2.0 Client ID (type: Web application) with authorized redirect URI `https://zgwckrpeveoemmwtriee.supabase.co/auth/v1/callback`
2. In the [Supabase dashboard](https://supabase.com/dashboard/project/zgwckrpeveoemmwtriee/auth/providers): Authentication → Sign In / Providers → Google → enable and paste the Client ID + Secret
3. Authentication → URL Configuration → set Site URL to `http://localhost:5173` (add your deployed URL later)

Legacy email test accounts (alice/bob/carol/teacher@test.com) can no longer sign in; their data is still visible in the app and admin panel.

**Staff access codes** (for the Faculty Gateway at `/faculty`; defined in `register_employee` in the DB — change them before real use): `FACULTY-2026` registers a teacher, `HOD-2026` registers an HOD. HODs can also promote existing users from the admin panel's Faculty tab.

## Architecture notes

- **Everything is a conversation** — club chats, announcement channels and DMs are rows in `conversations`; messages, read-state, typing channels and storage folders all key off the conversation UUID.
- **Security lives in the database** — every table has RLS. Membership checks use `security definer` helper functions (`is_club_member`, `is_conversation_member`, `can_post_in`) to avoid policy recursion. Verified: non-members read zero rows, cannot post, and cannot upload into conversations they don't belong to.
- **3 realtime channels per client** — `db-changes` (message inserts + read receipts, scoped by RLS), `presence:lobby` (online users), `typing:{conversationId}` (only while a chat is open).
- **Unread counts** — single `get_chat_list()` RPC returns every chat with title, last-message preview and unread count; no N+1 queries.
- The full schema (tables, triggers, RPCs, RLS policies, storage policies) is in [supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql).

### Trade-offs to know about

- The `attachments` storage bucket is **public-read**: anyone with the exact URL can fetch a file, but paths contain random UUIDs so they aren't guessable. Flip the bucket to private + signed URLs if clubs will share sensitive files.
- Email confirmation is bypassed by a DB trigger (`auto_confirm_email`) since no SMTP is configured — fine for a college project; remove the trigger and configure SMTP for production.
- Consider enabling [leaked password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) in the Supabase dashboard (Auth → Providers → Password).

## Supabase project

- Project: `clubconnect` (`zgwckrpeveoemmwtriee`), region `ap-south-1` (Mumbai), free tier — the Supabase project keeps its original name; only the app brand is AdraConnects
- The frontend connects with the publishable API key in `.env` (safe to expose — RLS is the security boundary)
