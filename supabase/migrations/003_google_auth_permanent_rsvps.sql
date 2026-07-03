-- AdraConnects — permanent RSVPs
-- Applied to Supabase project zgwckrpeveoemmwtriee as migration: permanent_rsvps
--
-- Auth note (dashboard configuration, not SQL): email/password sign-in is
-- disabled; Google is the only auth provider. Configure in the Supabase
-- dashboard under Authentication -> Providers -> Google (client ID + secret
-- from Google Cloud Console) and set the Site URL under Authentication ->
-- URL Configuration.

-- RSVPs are a one-time commitment: once submitted they cannot be changed
-- or withdrawn (update/delete policies removed; insert-once remains).
drop policy "rsvps_update_own" on public.event_rsvps;
drop policy "rsvps_delete_own" on public.event_rsvps;
