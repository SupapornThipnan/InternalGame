// ============================================================
// GoodByeFat — Apps Script backend (อ่าน + เขียน)
// วางโค้ดนี้ใน Google Sheet → Extensions → Apps Script
// 1) รันฟังก์ชัน setup หนึ่งครั้ง (สร้างชีต น้ำหนัก + ออกกำลังกาย ให้อัตโนมัติ)
// 2) Deploy → New deployment → Web app
//    Execute as: Me / Who has access: Anyone
// 3) ก็อป URL ที่ได้ไปวางในหน้าเว็บ แท็บตั้งค่า
// ============================================================
const SS = SpreadsheetApp.getActiveSpreadsheet();

const SHEET_WEIGHT = 'น้ำหนัก';
const SHEET_EXERCISE = 'ออกกำลังกาย';

// ⚠️ ลำดับคอลัมน์ต้องตรงกับ WEIGHT_FIELDS / EXERCISE_FIELDS ในไฟล์ index.html
// ถ้าเพิ่ม/ลดคอลัมน์ ต้องแก้ทั้ง 2 ที่ให้ตรงกัน
const HEADERS = {
  [SHEET_WEIGHT]: [
    'ID', 'วันที่', 'น้ำหนัก (กก.)', 'BMI', 'เปอร์เซ็นต์ไขมัน (%)', 'มวลไขมัน (กก.)',
    'มวลกล้ามเนื้อ (กก.)', 'มวลกล้ามเนื้อลาย (กก.)', 'น้ำในร่างกาย (%)', 'เปอร์เซ็นต์โปรตีน (%)',
    'ไขมันในช่องท้อง (ระดับ)', 'BMR (kcal)', 'อายุร่างกาย (ปี)', 'มวลกระดูก (กก.)',
    'น้ำหนักไร้ไขมัน (กก.)', 'คะแนนร่างกาย', 'หมายเหตุ',
  ],
  [SHEET_EXERCISE]: [
    'ID', 'วันที่', 'ประเภทกิจกรรม', 'ระยะเวลา (นาที)', 'แคลอรี่ (kcal)', 'ชีพจรเฉลี่ย (bpm)', 'หมายเหตุ',
  ],
};

// ---- รัน setup ได้เรื่อยๆ ปลอดภัย: สร้างชีตใหม่ถ้ายังไม่มี + เติมคอลัมน์ที่ขาดให้ชีตเก่า ----
// ⚠️ 2026-08-18: เดิมฟังก์ชันนี้เขียนหัวคอลัมน์เฉพาะตอนชีตว่างเปล่า (getLastRow() === 0) เท่านั้น
// พอเพิ่มคอลัมน์ใหม่ใน HEADERS แล้วรัน setup ซ้ำ มันเลยไม่ทำอะไรเลย ชีตยังเป็นโครงเก่าอยู่
// ผลคือ appendRow เขียนได้เฉพาะคอลัมน์ที่มีหัวอยู่จริง ค่าที่เว็บส่งมาเกินมาก็หายเงียบๆ
// (เจอจริงกับ "มวลไขมัน (กก.)" ที่ส่งมาแล้วแต่ไม่ขึ้นในชีต) ตอนนี้เลยเช็คและเติมคอลัมน์ที่ขาดให้ด้วย
function setup() {
  const report = [];
  Object.keys(HEADERS).forEach(function (name) {
    let sheet = SS.getSheetByName(name);
    if (!sheet) sheet = SS.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      styleHeader(sheet.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]));
      sheet.setFrozenRows(1);
      report.push(name + ': สร้างใหม่ ' + HEADERS[name].length + ' คอลัมน์');
    } else {
      report.push(name + ': ' + addMissingColumns(sheet, HEADERS[name]));
    }
  });
  const s1 = SS.getSheetByName('Sheet1');
  if (s1 && s1.getLastRow() === 0 && SS.getSheets().length > 1) SS.deleteSheet(s1);
  const msg = report.join('\n');
  Logger.log(msg);
  try { SS.toast(msg, 'setup เสร็จแล้ว', 15); } catch (e) { /* รันจากเมนู Apps Script จะไม่มี toast ก็ไม่เป็นไร */ }
  return msg;
}

function styleHeader(range) {
  return range.setFontWeight('bold').setBackground('#0f0f13').setFontColor('#22c55e');
}

// ---- เทียบหัวคอลัมน์ที่มีอยู่กับที่ควรจะเป็น แล้วแทรกเฉพาะตัวที่ขาดลงตรงตำแหน่งให้ ----
// แทรกคอลัมน์ (ไม่ใช่เขียนทับ) ข้อมูลเดิมของแถวเก่าจะเลื่อนไปพร้อมหัวคอลัมน์ของมันเอง ค่าไม่สลับช่อง
// ถ้าเจอคอลัมน์ที่มีอยู่แล้วแต่สลับตำแหน่งกัน จะไม่ย้ายให้อัตโนมัติ (เสี่ยงข้อมูลเพี้ยน) แต่จะโยน error บอกให้ดูเอง
function addMissingColumns(sheet, want) {
  const have = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); });
  const added = [];
  for (let i = 0; i < want.length; i++) {
    if (have[i] === want[i]) continue;
    if (have.indexOf(want[i]) !== -1) {
      throw new Error('ชีต "' + sheet.getName() + '" มีคอลัมน์ "' + want[i] + '" อยู่แล้วแต่ผิดตำแหน่ง '
        + '(อยู่ช่องที่ ' + (have.indexOf(want[i]) + 1) + ' แต่ควรอยู่ช่องที่ ' + (i + 1) + ') '
        + 'กรุณาย้ายเองในชีตให้ตรงลำดับก่อน แล้วค่อยรัน setup ใหม่');
    }
    if (i < have.length) {
      sheet.insertColumnBefore(i + 1); // แทรกคอลัมน์ใหม่ ดันของเดิมไปทางขวาทั้งแถว
    }
    styleHeader(sheet.getRange(1, i + 1).setValue(want[i]));
    have.splice(i, 0, want[i]);
    added.push(want[i]);
  }
  sheet.setFrozenRows(1);
  return added.length ? 'เพิ่มคอลัมน์ที่ขาด ' + added.length + ' ช่อง → ' + added.join(', ') : 'ครบอยู่แล้ว ไม่ต้องแก้';
}

// ---- อ่านข้อมูล: GET ?sheet=น้ำหนัก → { ok, data: [...] } ----
// ครอบ try/catch เหมือน doPost — ถ้ามี exception กลางทาง Apps Script จะส่ง "หน้า HTML error" กลับไป
// ฝั่งเว็บ parse JSON ไม่ได้ เลยขึ้นข้อความงงๆ ว่า Unexpected token '<' แทนที่จะบอกสาเหตุจริง
function doGet(e) {
  try {
    return doGetInner(e);
  } catch (err) {
    return json({ ok: false, error: 'EXCEPTION: ' + (err && err.message ? err.message : String(err)) });
  }
}

function doGetInner(e) {
  const sheet = SS.getSheetByName((e.parameter && e.parameter.sheet) || SHEET_WEIGHT);
  if (!sheet) return json({ ok: false, error: 'SHEET_NOT_FOUND' });
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift() || [];
  const data = rows
    .filter(function (r) { return r.some(function (c) { return c !== ''; }); })
    .map(function (r) {
      const o = {};
      headers.forEach(function (h, i) {
        o[h] = (r[i] instanceof Date) ? Utilities.formatDate(r[i], 'Asia/Bangkok', 'yyyy-MM-dd HH:mm') : r[i];
      });
      return o;
    });
  return json({ ok: true, data: data });
}

// ---- เขียนข้อมูล: POST { sheet, action: 'add'|'delete', data / id } ----
// ครอบ try/catch ทั้งก้อน — ถ้ามี exception กลางทาง Apps Script จะส่งหน้า HTML error กลับไป
// ฝั่งเว็บอ่าน JSON ไม่ได้ เลยขึ้นแค่ "บันทึกไม่สำเร็จ" ลอยๆ ไม่รู้สาเหตุ
function doPost(e) {
  try {
    return doPostInner(e);
  } catch (err) {
    return json({ ok: false, error: 'EXCEPTION: ' + (err && err.message ? err.message : String(err)) });
  }
}

function doPostInner(e) {
  const p = JSON.parse(e.postData.contents);
  const sheet = SS.getSheetByName(p.sheet);
  if (!sheet) return json({ ok: false, error: 'SHEET_NOT_FOUND: ' + p.sheet });
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  if (p.action === 'add') {
    sheet.appendRow(headers.map(function (h) { return p.data[h] !== undefined ? p.data[h] : ''; }));
  } else if (p.action === 'delete') {
    const idCol = headers.indexOf('ID') + 1;
    if (idCol === 0) return json({ ok: false, error: 'ID_COLUMN_NOT_FOUND' });
    const values = sheet.getRange(2, idCol, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
    const rowIdx = values.findIndex(function (r) { return String(r[0]) === String(p.id); });
    if (rowIdx === -1) return json({ ok: false, error: 'NOT_FOUND' });
    sheet.deleteRow(rowIdx + 2);
  } else {
    return json({ ok: false, error: 'UNKNOWN_ACTION' });
  }
  return json({ ok: true });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
