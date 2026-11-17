function doPost(event) {
  try {
    const properties = PropertiesService.getScriptProperties();
    const expectedSecret = properties.getProperty('CONTACT_FORM_SECRET');
    const payload = JSON.parse(event.postData.contents);

    if (!expectedSecret || expectedSecret.length < 32 || payload.secret !== expectedSecret) {
      return jsonResponse({ success: false, message: 'Unauthorized' });
    }

    const name = cleanText(payload.name, 100);
    const email = cleanText(payload.email, 254);
    const message = cleanText(payload.message, 5000);

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
      return jsonResponse({ success: false, message: 'Invalid submission' });
    }

    const spreadsheetId = properties.getProperty('SPREADSHEET_ID');
    if (!spreadsheetId) {
      return jsonResponse({ success: false, message: 'Spreadsheet is not configured' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      const sheetName = properties.getProperty('SHEET_NAME') || 'Contact submissions';
      let sheet = spreadsheet.getSheetByName(sheetName);

      if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
      }
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Submitted at', 'Full name', 'Email address', 'Message']);
      }

      sheet.appendRow([new Date(), name, email, message]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Contact submission failed: ' + error.message);
    return jsonResponse({ success: false, message: 'Unable to save submission' });
  }
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') {
    return '';
  }

  const text = value.trim();
  if (!text || text.length > maxLength) {
    return '';
  }

  return /^[\s\u0000-\u001f]*[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}