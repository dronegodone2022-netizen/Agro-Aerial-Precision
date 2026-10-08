const SHEET_NAME = 'ExamLocks';
const LOGIN_SHEET_NAME = 'Students';
const ADMIN_PHONE = '+23277840105';
const ADMIN_EMAIL = 'admin@agroaerialprecision.com';

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  const action = payload.action;

  if (action === 'loginStudent') {
    return jsonResponse(loginStudent_(payload.studentId, payload.pin));
  }

  if (action === 'getExamLock') {
    return jsonResponse(getExamLock_(payload.studentId));
  }

  if (action === 'createExamLock') {
    return jsonResponse(createExamLock_(payload));
  }

  if (action === 'resetExamLock') {
    return jsonResponse(resetExamLock_(payload.studentId, payload.token));
  }

  return jsonResponse({ ok: false, error: 'Unknown action' });
}

function doGet() {
  return jsonResponse({ ok: true, message: 'Agro Aerial Precision Apps Script backend is running.' });
}

function loginStudent_(studentId, pin) {
  const sheet = getOrCreateSheet_(LOGIN_SHEET_NAME, ['Student ID', 'Name', 'Email', 'PIN']);
  const values = sheet.getDataRange().getValues();
  const normalizedId = String(studentId || '').trim().toUpperCase();
  const normalizedPin = String(pin || '').trim();

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (String(row[0]).trim().toUpperCase() === normalizedId && String(row[3]).trim() === normalizedPin) {
      return {
        ok: true,
        data: {
          id: normalizedId,
          name: row[1],
          email: row[2],
          loginTime: new Date().toISOString(),
        },
      };
    }
  }

  return { ok: false, error: 'Invalid credentials' };
}

function createExamLock_(payload) {
  const studentId = String(payload.studentId || '').trim().toUpperCase();
  const studentName = String(payload.studentName || '').trim();
  const studentEmail = String(payload.studentEmail || '').trim();
  const score = Number(payload.score || 0);
  const percentage = Number(payload.percentage || 0);
  const token = Utilities.getUuid();
  const resetLink = buildResetLink_(studentId, token);
  const sheet = getOrCreateSheet_(SHEET_NAME, ['Student ID', 'Student Name', 'Email', 'Score', 'Percentage', 'Reset Token', 'Reset Link', 'Created At']);

  upsertLockRow_(sheet, studentId, [studentId, studentName, studentEmail, score, percentage, token, resetLink, new Date().toISOString()]);

  return {
    ok: true,
    data: {
      studentId,
      studentName,
      score,
      percentage,
      resetToken: token,
      resetLink,
      createdAt: new Date().toISOString(),
    },
  };
}

function getExamLock_(studentId) {
  const sheet = getOrCreateSheet_(SHEET_NAME, ['Student ID', 'Student Name', 'Email', 'Score', 'Percentage', 'Reset Token', 'Reset Link', 'Created At']);
  const values = sheet.getDataRange().getValues();
  const normalizedId = String(studentId || '').trim().toUpperCase();

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (String(row[0]).trim().toUpperCase() === normalizedId) {
      return {
        ok: true,
        data: {
          studentId: String(row[0]).trim().toUpperCase(),
          studentName: row[1],
          score: Number(row[3]),
          percentage: Number(row[4]),
          resetToken: row[5],
          resetLink: row[6],
          createdAt: row[7],
        },
      };
    }
  }

  return { ok: false, error: 'No exam lock found' };
}

function resetExamLock_(studentId, token) {
  const sheet = getOrCreateSheet_(SHEET_NAME, ['Student ID', 'Student Name', 'Email', 'Score', 'Percentage', 'Reset Token', 'Reset Link', 'Created At']);
  const values = sheet.getDataRange().getValues();
  const normalizedId = String(studentId || '').trim().toUpperCase();
  const normalizedToken = String(token || '').trim();

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (String(row[0]).trim().toUpperCase() === normalizedId && String(row[5]).trim() === normalizedToken) {
      sheet.deleteRow(i + 1);
      return { ok: true, data: { cleared: true } };
    }
  }

  return { ok: false, error: 'Invalid reset token' };
}

function upsertLockRow_(sheet, studentId, rowValues) {
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim().toUpperCase() === studentId) {
      sheet.getRange(i + 1, 1, 1, rowValues.length).setValues([rowValues]);
      return;
    }
  }

  sheet.appendRow(rowValues);
}

function getOrCreateSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('Agro Aerial Precision Backend');
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function buildResetLink_(studentId, token) {
  const baseUrl = ScriptApp.getService().getUrl();
  return `${baseUrl}?studentId=${encodeURIComponent(studentId)}&token=${encodeURIComponent(token)}`;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
