const PRIVACY_VERSION = '1.0';
const SHEET_NAME = 'Consent records';

/**
 * Run this function once from the Apps Script editor after setting SHEET_ID.
 */
function setupSheet() {
  const sheet = getSheet_();
  const headers = [
    'email',
    'consent_at',
    'plugin_version',
    'source',
    'privacy_version',
    'created_at'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
}

function doGet() {
  return json_({ ok: true, service: 'IN Auto Translate consent endpoint' });
}

function doPost(event) {
  try {
    const payload = parsePayload_(event);

    if (payload.website) {
      return json_({ ok: true });
    }

    if (payload.consent !== true || payload.privacy_version !== PRIVACY_VERSION) {
      return json_({ ok: false, code: 'consent_required' });
    }

    const email = normalizeEmail_(payload.email);
    if (!isValidEmail_(email)) {
      return json_({ ok: false, code: 'invalid_email' });
    }

    const consentAt = parseConsentDate_(payload.consent_at);
    const pluginVersion = cleanText_(payload.plugin_version, 30);
    const source = cleanText_(payload.source || 'wordpress-plugin', 40);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      const sheet = getSheet_();
      setupSheet();
      const existingRow = findEmailRow_(sheet, email);
      const values = [
        email,
        consentAt,
        pluginVersion,
        source,
        PRIVACY_VERSION,
        new Date()
      ];

      if (existingRow) {
        sheet.getRange(existingRow, 1, 1, values.length).setValues([values]);
      } else {
        sheet.appendRow(values);
      }
    } finally {
      lock.releaseLock();
    }

    return json_({ ok: true });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, code: 'server_error' });
  }
}

function getSheet_() {
  const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!sheetId) {
    throw new Error('Missing SHEET_ID script property.');
  }

  const spreadsheet = SpreadsheetApp.openById(sheetId);
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function parsePayload_(event) {
  if (!event || !event.postData || !event.postData.contents) {
    throw new Error('Missing request body.');
  }

  const payload = JSON.parse(event.postData.contents);
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
    throw new Error('Invalid request body.');
  }

  return payload;
}

function normalizeEmail_(value) {
  return String(value || '').trim().toLowerCase().slice(0, 254);
}

function isValidEmail_(email) {
  return email.length >= 3 && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanText_(value, maxLength) {
  return String(value || '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}

function parseConsentDate_(value) {
  const date = new Date(String(value || ''));
  return isNaN(date.getTime()) ? new Date() : date;
}

function findEmailRow_(sheet, email) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return 0;
  }

  const match = sheet
    .getRange(2, 1, lastRow - 1, 1)
    .createTextFinder(email)
    .matchEntireCell(true)
    .matchCase(false)
    .findNext();

  return match ? match.getRow() : 0;
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

