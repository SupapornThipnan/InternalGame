/**
 * รายรับ-รายจ่าย WEB — Apps Script backend (อ่าน + เขียน)
 * โดย น้องเอฟ (ทีม deetao)
 *
 * วิธี deploy: ดูใน README.md
 *   Deploy > New deployment > Web app
 *   Execute as: Me  /  Who has access: Anyone
 */

var SS = SpreadsheetApp.getActiveSpreadsheet();
var SHEET_NAME = 'รายการ';
var HEADERS = ['วันที่', 'จำนวนเงิน', 'ประเภท', 'รายละเอียด', 'หมวดหมู่'];

/* ============================================================
   1) ตั้งค่าครั้งแรก — รันฟังก์ชันนี้ 1 ครั้งก่อน deploy
   สร้างชีต "รายการ" + ย้ายข้อมูลเดิมจากชีตเก่ามาให้อัตโนมัติ
   ============================================================ */
function setupSheet() {
  var sheet = SS.getSheetByName(SHEET_NAME);
  if (sheet) {
    SpreadsheetApp.getUi().alert('มีชีต "' + SHEET_NAME + '" อยู่แล้ว ไม่ได้สร้างซ้ำครับ');
    return;
  }
  sheet = SS.insertSheet(SHEET_NAME);
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight('bold').setBackground('#222').setFontColor('#25F4EE');
  sheet.setFrozenRows(1);
  sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd');
  sheet.getRange('B:B').setNumberFormat('#,##0.00');
  sheet.setColumnWidth(1, 110);
  sheet.setColumnWidth(2, 110);
  sheet.setColumnWidth(3, 110);
  sheet.setColumnWidth(4, 220);
  sheet.setColumnWidth(5, 130);

  var moved = migrateOldSheet_(sheet);
  SpreadsheetApp.getUi().alert(
    'สร้างชีต "' + SHEET_NAME + '" เรียบร้อย\nย้ายข้อมูลเดิมมาให้ ' + moved + ' รายการครับ'
  );
}

/**
 * ย้ายข้อมูลจากชีตเดิม (คอลัมน์ A=วัน B=จำนวนเงิน C=ประเภท D=รายละเอียด E=หมวดหมู่)
 * เลข "วัน" ในชีตเดิมเป็นแค่วันที่ของเดือน — เติมปี/เดือนจากชื่อชีตหรือค่า default
 */
function migrateOldSheet_(target) {
  var YEAR = 2026;   // ปี ค.ศ. ของข้อมูลเดิม
  var MONTH = 7;     // เดือนของข้อมูลเดิม (กรกฎาคม)

  var sheets = SS.getSheets();
  var src = null;
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() !== SHEET_NAME) { src = sheets[i]; break; }
  }
  if (!src) return 0;

  var rows = src.getDataRange().getValues();
  var out = [];
  var day = null;

  for (var r = 1; r < rows.length; r++) {   // ข้ามแถวหัว "วัน"
    var d = rows[r][0], amt = rows[r][1], type = rows[r][2],
        note = rows[r][3], cat = rows[r][4];

    if (d !== '' && !isNaN(Number(d))) day = Number(d);
    if (amt === '' || amt === null) continue;
    if (!type || String(type).trim() === '') continue;   // ข้ามแถวสรุปท้ายชีต
    if (!day) continue;

    var num = Number(String(amt).replace(/,/g, ''));
    if (isNaN(num)) continue;

    out.push([
      new Date(YEAR, MONTH - 1, day),
      num,
      String(type).trim(),
      String(note || '').trim(),
      String(cat || '').trim()
    ]);
  }

  if (out.length) {
    target.getRange(2, 1, out.length, HEADERS.length).setValues(out);
  }
  return out.length;
}

/* ============================================================
   1b) migration ครั้งเดียว — เลิกใช้ประเภท "ADS" แล้ว
   แปลงแถวเก่าที่ยังเป็นประเภท "ADS" ให้เป็น "รายจ่าย" (หมวดหมู่ยังคง ADS เหมือนเดิม)
   รันฟังก์ชันนี้ 1 ครั้งจาก Apps Script editor แล้วลบทิ้งได้
   ============================================================ */
function migrateAdsTypeToExpense() {
  var sheet = SS.getSheetByName(SHEET_NAME);
  if (!sheet) { SpreadsheetApp.getUi().alert('ยังไม่มีชีต "' + SHEET_NAME + '" ครับ'); return; }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var typeCol = headers.indexOf('ประเภท') + 1;
  if (!typeCol) { SpreadsheetApp.getUi().alert('ไม่พบคอลัมน์ "ประเภท" ครับ'); return; }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var range = sheet.getRange(2, typeCol, lastRow - 1, 1);
  var values = range.getValues();
  var changed = 0;
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === 'ADS') {
      values[i][0] = 'รายจ่าย';
      changed++;
    }
  }
  range.setValues(values);
  SpreadsheetApp.getUi().alert('แปลงประเภท "ADS" → "รายจ่าย" แล้ว ' + changed + ' รายการครับ');
}

/* ============================================================
   2) อ่านข้อมูล — GET ?sheet=รายการ
   ============================================================ */
function doGet(e) {
  try {
    var name = (e && e.parameter && e.parameter.sheet) || SHEET_NAME;
    var sheet = SS.getSheetByName(name);
    if (!sheet) return json({ ok: false, error: 'SHEET_NOT_FOUND' });

    var rows = sheet.getDataRange().getValues();
    if (rows.length < 2) return json({ ok: true, data: [] });

    var headers = rows.shift();
    var data = rows
      .filter(function (r) { return r.some(function (c) { return c !== '' && c !== null; }); })
      .map(function (r, i) {
        var o = { _row: i + 2 };
        headers.forEach(function (h, j) {
          var v = r[j];
          if (v instanceof Date) v = Utilities.formatDate(v, SS.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
          o[h] = v;
        });
        return o;
      });
    return json({ ok: true, data: data });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/* ============================================================
   3) เขียนข้อมูล — POST { action:'add'|'update', data:{...}, row:N }
   ไม่มี action ลบ โดยตั้งใจ — กันข้อมูลหายถาวร
   ============================================================ */
function doPost(e) {
  try {
    var p = JSON.parse(e.postData.contents);
    var sheet = SS.getSheetByName(p.sheet || SHEET_NAME);
    if (!sheet) return json({ ok: false, error: 'SHEET_NOT_FOUND' });

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    if (p.action === 'add') {
      var row = headers.map(function (h) {
        var v = p.data[h];
        if (h === 'วันที่' && v) return new Date(v + 'T00:00:00');
        if (h === 'จำนวนเงิน') return Number(v) || 0;
        return v === undefined ? '' : v;
      });
      sheet.appendRow(row);
      return json({ ok: true, row: sheet.getLastRow() });
    }

    if (p.action === 'update') {
      var rowIdx = Number(p.row);
      if (!rowIdx || rowIdx < 2) return json({ ok: false, error: 'BAD_ROW' });
      headers.forEach(function (h, i) {
        if (p.data[h] === undefined) return;
        var v = p.data[h];
        if (h === 'วันที่' && v) v = new Date(v + 'T00:00:00');
        if (h === 'จำนวนเงิน') v = Number(v) || 0;
        sheet.getRange(rowIdx, i + 1).setValue(v);
      });
      return json({ ok: true });
    }

    return json({ ok: false, error: 'UNKNOWN_ACTION' });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
