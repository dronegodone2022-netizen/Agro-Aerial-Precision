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
| `VITE_GOOGLE_APPS_SCRIPT_URL` | Web app URL of the exam backend (below). Without it the live exam portal shows "not configured". |
| `VITE_MAILERLITE_FORM_ID` | ID of a MailerLite embedded form, used by the footer newsletter sign-up. |

Never put API keys or passwords in frontend code or `VITE_*` variables: everything
in the build is visible to every visitor.

## Exam backend (Google Apps Script)

Grading, timing and exam locks all run in `google-apps-script.gs`, so the answer
key never reaches the browser.

### Setup

1. Create a **private** Google Sheet. Open **Extensions > Apps Script** and paste in
   the contents of `google-apps-script.gs`.
2. Run the `setup` function once from the editor (approve the permissions). This
   creates the `Students`, `Questions`, `Attempts` and `ExamLocks` tabs.
3. **Students** tab: one row per student: `Student ID`, `Name`, `Email`, `PIN`.
   Format the PIN column as **Plain text** so PINs like `0123` keep their leading zero.
4. **Questions** tab: import `private/exam-questions.csv` (File > Import > Append to
   current sheet), or type questions in. `Correct Option` is the option number (1-4).
   The `private/` folder is git-ignored; never commit the answer key.
5. **Project Settings > Script Properties**: add `ADMIN_KEY` with a long random
   password. Admins enter it on `/#/admin-reset`.
6. **Deploy > New deployment > Web app**: Execute as **Me**, Who has access
   **Anyone**. Copy the web app URL into the `VITE_GOOGLE_APPS_SCRIPT_URL` variable.
   After editing the script later, use **Deploy > Manage deployments > Edit > New version**
   so the URL stays the same.

### How it works

* Students log in at `/#/student-login` and get a session token from the server.
* The 5-minute timer is enforced by the server. Reloading or logging in again does
  not reset it, and late submissions are graded as blank.
* Pass mark is 80%. A failed attempt locks the exam and emails the admin the
  results plus a one-time reset link.
* After the retake fee is paid, the admin either opens that link or uses
  `/#/admin-reset` with the admin key to unlock the exam.
* Correct answers and explanations are shown only to students who pass.

## Certificates

`/#/qr` generates a QR code pointing to `/#/verify/<certificate id>`. Verification
reads the published certificates Google Sheet (see `src/data/useCertificates.ts`).

## Assets

Only files in `src/assets/` that the site uses are deployed. Source artwork (`.psd`)
and unused photos live in `design-source/`. Compress new photos to roughly 1920px
wide (quality ~80) before adding them.
