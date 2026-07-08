<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Google Apps Script backend

This project can use Google Apps Script as the backend for student login, exam lock storage, and admin reset handling.

### Setup

1. Open the `google-apps-script.gs` file and copy its contents into a new Google Apps Script project.
2. Create a Google Sheet and bind it to the script, or let the script create one on first run.
3. Add student records to the `Students` sheet with columns: `Student ID`, `Name`, `Email`, `PIN`.
4. Deploy the Apps Script project as a Web App.
5. Copy the deployed Web App URL into your frontend environment as `VITE_GOOGLE_APPS_SCRIPT_URL`.

### Frontend environment example

```env
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### What it does

* Students log in through Google Apps Script instead of local demo data when the script URL is configured.
* Failed exam attempts are stored remotely and stay locked until the admin reset link is used.
* The admin reset link clears the exam lock through the Apps Script backend.
* Admins can open `/#/admin-reset` to look up a locked exam and send the reset link on WhatsApp.


