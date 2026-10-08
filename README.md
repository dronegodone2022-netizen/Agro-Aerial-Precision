# Agro Aerial Precision website

React + Vite + Tailwind CSS v4 site, deployed to GitHub Pages by
`.github/workflows/deploy-pages.yml` on every push to `main`.

```bash
npm install
npm run dev      # local development (exam pages use a built-in demo backend)
npm run build    # type-check + production build into dist/
```

## Configuration

Set these as **repository variables** on GitHub
(Settings > Secrets and variables > Actions > Variables). For local builds,
copy `.env.example` to `.env`.

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL (Project Settings > API). |
| `VITE_SUPABASE_ANON_KEY` | Supabase **anon / publishable** key. It is safe to publish: the database only lets it call the exam and certificate functions. **Never** use the `service_role` key here. |
| `VITE_MAILERLITE_FORM_ID` | ID of a MailerLite embedded form, used by the footer newsletter sign-up. |

Never put secret keys or passwords in frontend code or `VITE_*` variables: everything
in the build is visible to every visitor.

## Backend (Supabase)

The exam and certificate verification run on Supabase. All logic lives in Postgres
functions in `supabase/migrations/`. Every table is locked down (RLS on, no policies,
privileges revoked), so the browser can only call those functions. The answer key
never reaches the browser.

### Setup

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor**: paste and run `supabase/migrations/20261008000000_init.sql`.
3. **SQL Editor**: run `private/seed-questions.sql` to load the exam questions.
   The `private/` folder is git-ignored; never commit the answer key.
   To edit questions later, use the `exam_questions` table. `options` is a list, and
   `correct_option` is the position of the right answer, starting at 1.
4. **Table Editor > students**: add one row per student (`id`, `name`, `email`, `pin`).
   Type the PIN as plain text. It is hashed automatically when saved.
5. **Table Editor > certificates**: import your certificate CSV (columns `id`, `name`,
   `course`, `issued_on`, `drive_link`; drop the old `qr` column). Then unpublish the old
   Google Sheet, because it exposes every certificate holder's name.
6. **Admins**:
   * **Authentication > Users > Add user**: create your admin account (email + password).
   * **SQL Editor**: `insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';`
   * Recommended: **Authentication > Sign In / Providers**: turn off "Allow new users to sign up".
     Strangers who sign up still can't do anything, but there's no reason to allow it.
7. Put the project URL and anon key into the GitHub repository variables above.

### How the exam works

* Students log in at `/#/student-login` with their ID and PIN. 5 wrong PINs lock that ID
  for 15 minutes.
* The 5-minute timer is enforced by the database. Reloading or logging in again doesn't
  reset it, and late submissions are graded as blank.
* Pass mark is 80%. A failed attempt locks the exam.
* Admins sign in at `/#/admin` to see locked students and recent results, and to unlock
  a student after the retake fee is paid.
* Correct answers and explanations are shown only to students who pass.
* Timing, pass mark and session length are set in `_exam_config()` in the migration.

### Local development

Without `VITE_SUPABASE_*` set, `npm run dev` uses a built-in demo backend
(`src/demoExamBackend.ts`): student `AAP-001` / `1234`, admin `admin@example.com` /
`demo-admin`. It is never included in production builds.

## Certificates

`/#/qr` generates a QR code pointing to `/#/verify/<certificate id>`. Verification looks up
one ID at a time in the Supabase `certificates` table. Until Supabase is configured, it
falls back to the old published Google Sheet.

## Assets

Only files in `src/assets/` that the site uses are deployed. Source artwork (`.psd`)
and unused photos live in `design-source/`. Compress new photos to roughly 1920px
wide (quality ~80) before adding them.
