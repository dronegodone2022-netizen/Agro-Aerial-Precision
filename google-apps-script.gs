/**
 * Agro Aerial Precision - exam backend (Google Apps Script web app).
 *
 * All grading happens here, so the answer key never reaches the browser.
 * The answer key lives in the "Questions" sheet of the bound spreadsheet -
 * keep that spreadsheet private and never paste answers into this file
 * (this file is in the public website repository).
 *
 * Setup steps are in README.md.
 */

const SITE_URL = 'https://dronegodone2022-netizen.github.io/Agro-Aerial-Precision/';
const ADMIN_EMAIL = 'admin@agroaerialprecision.com';

const EXAM_DURATION_SECONDS = 5 * 60;
const SUBMIT_GRACE_SECONDS = 60; // allowance for slow connections when the timer runs out
const PASSING_PERCENTAGE = 80;

const SESSION_TTL_SECONDS = 2 * 60 * 60;
const MAX_LOGIN_FAILURES = 5;
const MAX_ADMIN_FAILURES = 10;
const FAILURE_WINDOW_SECONDS = 15 * 60;

const SHEETS = {
  students: { name: 'Students', headers: ['Student ID', 'Name', 'Email', 'PIN'] },
  questions: { name: 'Questions', headers: ['ID', 'Question', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Correct Option', 'Rationale'] },
  attempts: { name: 'Attempts', headers: ['Student ID', 'Name', 'Email', 'Started At', 'Submitted At', 'Score', 'Total', 'Percentage', 'Passed', 'Answers'] },
  locks: { name: 'ExamLocks', headers: ['Student ID', 'Student Name', 'Email', 'Score', 'Percentage', 'Reset Token', 'Created At'] },
};

const ACTIONS = {
  loginStudent: loginStudent_,
  getExam: getExam_,
  submitExam: submitExam_,
  checkResetToken: checkResetToken_,
  resetExamLock: resetExamLock_,
  adminGetLock: adminGetLock_,
  adminResetLock: adminResetLock_,
};

// ---------------------------------------------------------------------------
// Web app entry points
// ---------------------------------------------------------------------------

function doPost(e) {
  let payload;
  try {
    payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return jsonResponse_({ ok: false, error: 'Invalid request.' });
  }

  const handler = ACTIONS[payload.action];
  if (!handler) {
    return jsonResponse_({ ok: false, error: 'Unknown action.' });
  }

  try {
    return jsonResponse_({ ok: true, data: handler(payload) });
  } catch (err) {
    if (err && err.isPublic) {
      return jsonResponse_({ ok: false, error: err.message });
    }
    console.error(err);
    return jsonResponse_({ ok: false, error: 'Server error. Please try again.' });
  }
}

function doGet() {
  return jsonResponse_({ ok: true, data: { message: 'Agro Aerial Precision exam backend is running.' } });
}

/** Run once from the editor to create any missing sheets with their headers. */
function setup() {
  Object.keys(SHEETS).forEach(function (key) { getSheet_(key); });
}

// ---------------------------------------------------------------------------
// Student actions
// ---------------------------------------------------------------------------

function loginStudent_(payload) {
  const studentId = normalizeId_(payload.studentId);
  const pin = String(payload.pin || '').trim();
  const failKey = 'loginfail:' + studentId;

  if (countFailures_(failKey) >= MAX_LOGIN_FAILURES) {
    throw publicError_('Too many failed attempts. Please wait 15 minutes and try again.');
  }

  const student = findStudent_(studentId);
  if (!student || !pin || student.pin !== pin) {
    recordFailure_(failKey);
    throw publicError_('Invalid Student ID or PIN.');
  }

  clearFailures_(failKey);
  const sessionToken = Utilities.getUuid() + Utilities.getUuid();
  CacheService.getScriptCache().put('session:' + sessionToken, student.id, SESSION_TTL_SECONDS);

  return { sessionToken: sessionToken, student: publicStudent_(student) };
}

function getExam_(payload) {
  const student = requireStudent_(payload.sessionToken);

  return withScriptLock_(function () {
    const existingLock = findLock_(student.id);
    if (existingLock) {
      return { status: 'locked', student: publicStudent_(student), result: lockResult_(existingLock) };
    }

    let attempt = findLatestAttempt_(student.id);

    if (attempt && attempt.submittedAt && attempt.passed) {
      return { status: 'passed', student: publicStudent_(student), result: attemptResult_(attempt) };
    }

    if (!attempt || attempt.submittedAt) {
      attempt = startAttempt_(student);
    }

    const elapsedSeconds = (Date.now() - attempt.startedAt.getTime()) / 1000;

    // Time ran out and nothing was submitted (tab closed, etc.): grade as blank.
    if (elapsedSeconds > EXAM_DURATION_SECONDS + SUBMIT_GRACE_SECONDS) {
      const graded = gradeAttempt_(student, attempt, {});
      return { status: graded.status, student: publicStudent_(student), result: graded.result };
    }

    return {
      status: 'in_progress',
      student: publicStudent_(student),
      secondsRemaining: Math.max(0, Math.floor(EXAM_DURATION_SECONDS - elapsedSeconds)),
      questions: loadQuestions_().map(function (q) {
        return {
          id: q.id,
          question: q.question,
          options: q.options.map(function (text, index) { return { id: index + 1, text: text }; }),
        };
      }),
    };
  });
}

function submitExam_(payload) {
  const student = requireStudent_(payload.sessionToken);
  const answers = payload.answers && typeof payload.answers === 'object' ? payload.answers : {};

  return withScriptLock_(function () {
    const existingLock = findLock_(student.id);
    if (existingLock) {
      return { status: 'locked', result: lockResult_(existingLock), review: [] };
    }

    const attempt = findLatestAttempt_(student.id);
    if (!attempt || attempt.submittedAt) {
      throw publicError_('There is no exam in progress. Please reload the page.');
    }

    const elapsedSeconds = (Date.now() - attempt.startedAt.getTime()) / 1000;
    const isLate = elapsedSeconds > EXAM_DURATION_SECONDS + SUBMIT_GRACE_SECONDS;

    return gradeAttempt_(student, attempt, isLate ? {} : answers);
  });
}

// ---------------------------------------------------------------------------
// Reset actions
// ---------------------------------------------------------------------------

/** Used by the reset link that is emailed to the admin. */
function checkResetToken_(payload) {
  const lock = findLockByToken_(payload.studentId, payload.token);
  if (!lock) throw publicError_('Invalid or expired reset link.');
  return lockSummary_(lock);
}

function resetExamLock_(payload) {
  const lock = findLockByToken_(payload.studentId, payload.token);
  if (!lock) throw publicError_('Invalid or expired reset link.');
  getSheet_('locks').deleteRow(lock.rowNumber);
  return { cleared: true };
}

function adminGetLock_(payload) {
  requireAdmin_(payload.adminKey);
  const lock = findLock_(normalizeId_(payload.studentId));
  if (!lock) throw publicError_('No locked exam was found for that student ID.');

  const summary = lockSummary_(lock);
  summary.email = lock.email;
  summary.createdAt = lock.createdAt;
  summary.resetLink = buildResetLink_(lock.studentId, lock.resetToken);
  return summary;
}

function adminResetLock_(payload) {
  requireAdmin_(payload.adminKey);
  const lock = findLock_(normalizeId_(payload.studentId));
  if (!lock) throw publicError_('No locked exam was found for that student ID.');
  getSheet_('locks').deleteRow(lock.rowNumber);
  return { cleared: true };
}

// ---------------------------------------------------------------------------
// Grading
// ---------------------------------------------------------------------------

function gradeAttempt_(student, attempt, answers) {
  const questions = loadQuestions_();
  let score = 0;

  const review = questions.map(function (q) {
    const chosenOption = Number(answers[q.id]) || null;
    const isCorrect = chosenOption === q.correctOption;
    if (isCorrect) score++;
    return { questionId: q.id, chosenOption: chosenOption, isCorrect: isCorrect };
  });

  const total = questions.length;
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= PASSING_PERCENTAGE;

  getSheet_('attempts')
    .getRange(attempt.rowNumber, 5, 1, 6)
    .setValues([[new Date(), score, total, percentage, passed, JSON.stringify(answers)]]);

  let resetToken = '';
  if (!passed) {
    resetToken = Utilities.getUuid();
    getSheet_('locks').appendRow([student.id, student.name, student.email, score, percentage, resetToken, new Date()]);
  }

  sendResultEmail_(student, { score: score, total: total, percentage: percentage, passed: passed }, review, questions, resetToken);

  const response = {
    status: passed ? 'passed' : 'locked',
    result: { score: score, total: total, percentage: percentage, passed: passed },
    review: review,
  };

  // Correct answers and explanations are only revealed to students who passed,
  // so a failed student can't memorise the key before a retake.
  if (passed) {
    response.explanations = questions.map(function (q) {
      return { questionId: q.id, correctOption: q.correctOption, rationale: q.rationale };
    });
  }

  return response;
}

function sendResultEmail_(student, result, review, questions, resetToken) {
  const lines = questions.map(function (q, i) {
    const r = review[i];
    const chosen = r.chosenOption ? q.options[r.chosenOption - 1] : 'Not answered';
    return 'Q' + q.id + ': ' + chosen + (r.isCorrect ? '  [CORRECT]' : '  [INCORRECT]');
  });

  const body = [
    'DRONE OPERATIONS & MAPPING CERTIFICATION EXAM - RESULTS',
    '',
    'Student: ' + student.name + ' (' + student.id + ')',
    'Email: ' + student.email,
    'Date: ' + new Date().toString(),
    '',
    'Score: ' + result.score + ' / ' + result.total + ' (' + result.percentage + '%)',
    'Status: ' + (result.passed ? 'PASSED' : 'NOT PASSED'),
    'Passing threshold: ' + PASSING_PERCENTAGE + '%',
    '',
    'Answers:',
  ].concat(lines);

  if (resetToken) {
    body.push('', 'The exam is now locked. After the retake fee is paid, open this link to unlock it:');
    body.push(buildResetLink_(student.id, resetToken));
  }

  try {
    MailApp.sendEmail(ADMIN_EMAIL, 'Drone Exam Results - ' + student.name + ' (' + student.id + ')', body.join('\n'));
  } catch (err) {
    // Email quota or permission problems must not lose the student's result.
    console.error('Failed to send result email', err);
  }
}

// ---------------------------------------------------------------------------
// Data access
// ---------------------------------------------------------------------------

function findStudent_(studentId) {
  const values = getSheet_('students').getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (normalizeId_(row[0]) === studentId) {
      return { id: studentId, name: String(row[1]), email: String(row[2]), pin: String(row[3]).trim() };
    }
  }
  return null;
}

function requireStudent_(sessionToken) {
  const studentId = sessionToken ? CacheService.getScriptCache().get('session:' + sessionToken) : null;
  const student = studentId ? findStudent_(studentId) : null;
  if (!student) throw publicError_('Your session has expired. Please log in again.');
  return student;
}

function requireAdmin_(adminKey) {
  const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!expected) throw publicError_('ADMIN_KEY is not set in the Apps Script project properties.');

  const failKey = 'adminfail';
  if (countFailures_(failKey) >= MAX_ADMIN_FAILURES) {
    throw publicError_('Too many failed attempts. Please wait 15 minutes and try again.');
  }
  if (String(adminKey || '') !== expected) {
    recordFailure_(failKey);
    throw publicError_('Invalid admin key.');
  }
}

function loadQuestions_() {
  const values = getSheet_('questions').getDataRange().getValues();
  const questions = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const id = String(row[0]).trim();
    if (!id) continue;

    const options = row.slice(2, 6).map(function (v) { return String(v).trim(); }).filter(Boolean);
    const correctOption = Number(row[6]);
    if (!correctOption || correctOption < 1 || correctOption > options.length) {
      throw publicError_('Question ' + id + ' has an invalid "Correct Option" value.');
    }

    questions.push({ id: id, question: String(row[1]), options: options, correctOption: correctOption, rationale: String(row[7] || '') });
  }

  if (!questions.length) throw publicError_('No exam questions have been set up yet.');
  return questions;
}

function findLatestAttempt_(studentId) {
  const values = getSheet_('attempts').getDataRange().getValues();
  for (let i = values.length - 1; i >= 1; i--) {
    const row = values[i];
    if (normalizeId_(row[0]) === studentId) {
      return {
        rowNumber: i + 1,
        startedAt: toDate_(row[3]),
        submittedAt: row[4] ? toDate_(row[4]) : null,
        score: Number(row[5]),
        total: Number(row[6]),
        percentage: Number(row[7]),
        passed: row[8] === true || String(row[8]).toUpperCase() === 'TRUE',
      };
    }
  }
  return null;
}

function startAttempt_(student) {
  const sheet = getSheet_('attempts');
  const startedAt = new Date();
  sheet.appendRow([student.id, student.name, student.email, startedAt, '', '', '', '', '', '']);
  return { rowNumber: sheet.getLastRow(), startedAt: startedAt, submittedAt: null };
}

function findLock_(studentId) {
  const values = getSheet_('locks').getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (normalizeId_(row[0]) === studentId) {
      return {
        rowNumber: i + 1,
        studentId: studentId,
        studentName: String(row[1]),
        email: String(row[2]),
        score: Number(row[3]),
        percentage: Number(row[4]),
        resetToken: String(row[5]).trim(),
        createdAt: row[6] ? toDate_(row[6]).toISOString() : '',
      };
    }
  }
  return null;
}

function findLockByToken_(studentId, token) {
  const lock = findLock_(normalizeId_(studentId));
  const normalizedToken = String(token || '').trim();
  return lock && normalizedToken && lock.resetToken === normalizedToken ? lock : null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSheet_(key) {
  const config = SHEETS[key];
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('This script must be bound to a spreadsheet (Extensions > Apps Script).');

  let sheet = spreadsheet.getSheetByName(config.name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(config.name);
    sheet.appendRow(config.headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function withScriptLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function countFailures_(key) {
  return Number(CacheService.getScriptCache().get(key) || 0);
}

function recordFailure_(key) {
  CacheService.getScriptCache().put(key, String(countFailures_(key) + 1), FAILURE_WINDOW_SECONDS);
}

function clearFailures_(key) {
  CacheService.getScriptCache().remove(key);
}

function publicStudent_(student) {
  return { id: student.id, name: student.name, email: student.email };
}

function lockResult_(lock) {
  return { score: lock.score, percentage: lock.percentage, passed: false };
}

function attemptResult_(attempt) {
  return { score: attempt.score, total: attempt.total, percentage: attempt.percentage, passed: attempt.passed };
}

function lockSummary_(lock) {
  return { studentId: lock.studentId, studentName: lock.studentName, score: lock.score, percentage: lock.percentage };
}

function buildResetLink_(studentId, token) {
  return SITE_URL + '#/exam-reset?studentId=' + encodeURIComponent(studentId) + '&token=' + encodeURIComponent(token);
}

function normalizeId_(value) {
  return String(value || '').trim().toUpperCase();
}

function toDate_(value) {
  return value instanceof Date ? value : new Date(value);
}

function publicError_(message) {
  const err = new Error(message);
  err.isPublic = true;
  return err;
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
