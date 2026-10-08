# Agro Aerial Precision website

React + Vite + Tailwind CSS v4 site, deployed to GitHub Pages by
`.github/workflows/deploy-pages.yml` on every push to `main`.

```bash
npm install
npm run dev      # local development (uses the Supabase project in .env)
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

Accounts, course enrolments, the exam and certificate verification run on Supabase.
Logic lives in Postgres functions in `supabase/migrations/`. Every table is locked down
(RLS on, no policies, privileges revoked), so the browser can only call those functions.
The answer key never reaches the browser.

### Setup

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor**: run each file in `supabase/migrations/` in order (oldest first).
3. **SQL Editor**: run `private/seed-questions.sql` to load the exam questions.
   The `private/` folder is git-ignored; never commit the answer key.
   To edit questions later, use the `exam_questions` table. `options` is a list, and
   `correct_option` is the position of the right answer, starting at 1.
4. Add certificates from `/#/admin` > Certificates (or import a CSV with `id`, `name`,
   `course`, `issued_on`, `drive_link` in **Table Editor > certificates**).
5. **Admins**: create the user in **Authentication > Users > Add user**, then run
   `insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';`
6. **Authentication > URL Configuration**:
   * Site URL: `https://dronegodone2022-netizen.github.io/Agro-Aerial-Precision/`
   * Redirect URLs: add `https://dronegodone2022-netizen.github.io/Agro-Aerial-Precision/**`
     and `http://localhost:5173/**`
7. **Authentication > Sign In / Providers > Email**: "Allow new users to sign up" must be **on**.
   Admin rights come only from the `admins` table, so public sign-up is safe.
8. **Email delivery** (needed for password-reset and confirmation emails). Supabase's
   built-in email only delivers to your own team's addresses. Create a free
   [Resend](https://resend.com) account, verify `agroaerialprecision.com`, then enter its
   SMTP details in **Authentication > Emails > SMTP Settings**. Until this is done, turn
   **off** "Confirm email" so new students can sign in straight after registering.
9. Put the project URL and anon key into the GitHub repository variables above.

### How it works

* **Students** create an account at `/#/register` (name, email, WhatsApp number,
  password) and get a Student ID such as `AAP-26-0001`. They sign in at
  `/#/student-login` and manage everything from the Student Portal at `/#/student`.
  Forgotten passwords are reset by email from `/#/forgot-password`.
* **Enrolling**: "Enroll" on the Academy page requires an account. The enrolment is saved
  as *pending* and WhatsApp opens so the team can send payment details.
* **Admins** sign in at `/#/admin` to approve or reject enrolments, unlock exams and see
  recent results.
* **Exam**: only students with an *approved* enrolment can take it. The 5-minute timer is
  enforced by the database. Reloading doesn't reset it, and late submissions are graded
  as blank. Pass mark is 80%. A failed attempt locks the exam until an admin unlocks it.
  Correct answers and explanations are shown only to students who pass.
* Timing, pass mark and session length are set in `_exam_config()` in the first migration.

`npm run dev` uses the Supabase project in `.env`, so local testing uses real data.

## Certificates

* **Anyone** can verify a certificate without an account: scan its QR code (opens
  `/#/verify/<certificate id>`) or type the ID on `/#/verify` or the Academy page.
  Lookups are one ID at a time, so the list of certificate holders stays private.
* **Admins** add, edit and delete certificates at `/#/admin` > **Certificates**: pick the
  student (optional), course and date, upload the PDF/JPG/PNG (or paste a link), and
  save. The certificate ID is suggested automatically (`AAPA-<course code>_<initials><year>-<number>`)
  and the QR code is ready to download straight away.
* Uploaded files live in the public `certificates` Supabase Storage bucket. Anyone with
  the link can open a file, but only admins can upload, replace, delete or list them.
* `/#/qr` can re-create the QR code for any existing certificate ID.

## Assets

Only files in `src/assets/` that the site uses are deployed. Source artwork (`.psd`)
and unused photos live in `design-source/`. Compress new photos to roughly 1920px
wide (quality ~80) before adding them.
