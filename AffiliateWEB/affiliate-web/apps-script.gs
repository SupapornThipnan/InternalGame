// ============================================================
// deetao Affiliate — Apps Script backend (อ่าน + เขียน)
// วางโค้ดนี้ใน Google Sheet → Extensions → Apps Script
// 1) รันฟังก์ชัน setup หนึ่งครั้ง (สร้างชีต สินค้า + ยอดขาย ให้อัตโนมัติ)
// 2) Deploy → New deployment → Web app
//    Execute as: Me / Who has access: Anyone
// ============================================================
const SS = SpreadsheetApp.getActiveSpreadsheet();

const HEADERS = {
  'สินค้า': ['SKU', 'ชื่อสินค้า', 'หมวดหมู่', 'ราคา', 'ค่าคอม %', 'Link สินค้า', 'จำนวน EP', 'สถานะ'],
  'ยอดขาย': ['วันที่', 'SKU', 'จำนวนชิ้น', 'ยอดขาย', 'ค่าคอม', 'EP'],
};

// ---- รันครั้งแรกครั้งเดียว: สร้างชีตพร้อมหัวคอลัมน์ ----
function setup() {
  Object.keys(HEADERS).forEach(function (name) {
    let sheet = SS.getSheetByName(name);
    if (!sheet) sheet = SS.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]])
        .setFontWeight('bold').setBackground('#0f0f13').setFontColor('#25F4EE');
      sheet.setFrozenRows(1);
    }
  });
  // ลบ Sheet1 เปล่าทิ้ง (เฉพาะกรณีที่ว่างจริงๆ เท่านั้น)
  const s1 = SS.getSheetByName('Sheet1');
  if (s1 && s1.getLastRow() === 0 && SS.getSheets().length > 1) SS.deleteSheet(s1);
}

// ---- อ่านข้อมูล: GET ?sheet=สินค้า → { ok, data: [...] } ----
// เพิ่ม &raw=1 → คืนข้อมูลดิบเป็นแถวๆ (สำหรับชีตที่ไม่มีหัวคอลัมน์ เช่น 📝#คำอธิบาย)
// เพิ่ม &list=1 → คืนรายชื่อชีตทั้งหมด (ใช้เลือกชีต TODOLIST เดือนปัจจุบันจากหน้าเว็บ)
function doGet(e) {
  if (e.parameter && e.parameter.list === '1') {
    return json({ ok: true, sheets: SS.getSheets().map(function (s) { return s.getName(); }) });
  }
  const sheet = SS.getSheetByName((e.parameter && e.parameter.sheet) || 'สินค้า');
  if (!sheet) return json({ ok: false, error: 'SHEET_NOT_FOUND' });
  if (e.parameter && e.parameter.raw === '1') {
    return json({ ok: true, rows: sheet.getDataRange().getDisplayValues() });
  }
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift() || [];
  const data = rows
    .filter(function (r) { return r.some(function (c) { return c !== ''; }); })
    .map(function (r) {
      const o = {};
      headers.forEach(function (h, i) {
        o[h] = (r[i] instanceof Date) ? Utilities.formatDate(r[i], 'Asia/Bangkok', 'yyyy-MM-dd') : r[i];
      });
      return o;
    });
  return json({ ok: true, data: data });
}

// ---- เขียนข้อมูล: POST { sheet, action: 'add'|'update', ... } ----
// ตั้งใจไม่มี action ลบแถว — กันข้อมูลหายถาวร
function doPost(e) {
  const p = JSON.parse(e.postData.contents);
  const sheet = SS.getSheetByName(p.sheet);
  if (!sheet) return json({ ok: false, error: 'SHEET_NOT_FOUND' });
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  if (p.action === 'add') {
    sheet.appendRow(headers.map(function (h) { return p.data[h] !== undefined ? p.data[h] : ''; }));
  } else if (p.action === 'update') {
    const keyCol = headers.indexOf(p.keyColumn) + 1;
    if (keyCol === 0) return json({ ok: false, error: 'KEY_COLUMN_NOT_FOUND' });
    const values = sheet.getRange(2, keyCol, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
    const rowIdx = values.findIndex(function (r) { return String(r[0]) === String(p.key); });
    if (rowIdx === -1) return json({ ok: false, error: 'NOT_FOUND' });
    headers.forEach(function (h, i) {
      if (p.data[h] !== undefined) sheet.getRange(rowIdx + 2, i + 1).setValue(p.data[h]);
    });
  } else if (p.action === 'markPosted') {
    return markPosted(sheet, p);
  } else if (p.action === 'setStage') {
    return setStage(sheet, p);
  } else if (p.action === 'setProgress') {
    return setProgressRow(sheet, p);
  } else if (p.action === 'toggleShopeeDraft') {
    return toggleShopeeDraft(sheet, p);
  } else if (p.action === 'updatePostLink') {
    return updatePostLink(sheet, p);
  } else if (p.action === 'unmarkPosted') {
    return unmarkPosted(sheet, p);
  } else if (p.action === 'markNoShopeeLink') {
    return markNoShopeeLink(sheet, p);
  } else if (p.action === 'restoreShopeeCheckbox') {
    return restoreShopeeCheckbox(sheet, p);
  } else if (p.action === 'bumpProgressDay') {
    return bumpProgressDay(sheet, p);
  } else {
    return json({ ok: false, error: 'UNKNOWN_ACTION' });
  }
  return json({ ok: true });
}

// ---- หาแถวจริงใน TODOLIST จากรหัส ITM + เลข EP สดๆ ทุกครั้ง (ไม่เชื่อเลขแถวที่แคชไว้ฝั่งเว็บ) ----
// เพราะ 1 สินค้าโผล่ได้หลายแถว (คนละ EP) ในชีตเดียวกัน จะจับคู่ด้วยรหัส ITM อย่างเดียวแบบ ⚡️Progress ไม่ได้
// ต้องจับคู่ ITM+EP พร้อมกันถึงจะได้แถวที่ถูกต้องจริง แก้ปัญหาเดียวกับที่เจอใน setProgressRow (พี่แยมแทรกแถวกลางคัน)
function findTodolistRow(sheet, itmCode, epNum) {
  const lastRow = sheet.getLastRow();
  const items = sheet.getRange(1, TODOLIST_ITEM_COL, lastRow, 1).getValues();
  const eps = sheet.getRange(1, TODOLIST_EP_COL, lastRow, 1).getValues();
  for (let r = 0; r < items.length; r++) {
    const itemText = String(items[r][0] || '');
    const itmMatch = itemText.match(/ITM[_\s]?\d+/i);
    if (!itmMatch || itmMatch[0].toUpperCase().replace(/\s/g, '_') !== itmCode) continue;
    const rowEp = parseFloat(String(eps[r][0] || '').replace(/EP\.?/i, '').trim());
    if (rowEp === epNum) return r + 1;
  }
  return 0;
}
function resolveTodolistRow(sheet, p) {
  const itmCode = String(p.itmCode || '').toUpperCase().replace(/\s/g, '_');
  const epNum = parseFloat(String(p.epText || '').replace(/EP\.?/i, '').trim());
  if (!itmCode || isNaN(epNum)) return 0;
  return findTodolistRow(sheet, itmCode, epNum);
}

// ---- ติ๊ก/เลิกติ๊กช่อง Scripts/Sounds/Footage/Final/UpSpace (จากคิวคลิปในหน้าเว็บ) ----
// ไม่แตะ ⚡️Progress จากตรงนี้แล้ว — พี่แยมกรอก Scripts/Sounds/Footage/Draft เข้า Progress เองผ่านหน้า
// ✍️ กรอก Progress โดยเฉพาะ มีแค่ Final ที่ยัง sync อัตโนมัติ (ดู markPosted ด้านล่าง)
// TODOLIST_STAGE_COLS = 4 ตัวที่ผูกกับการติ๊ก/เลิกติ๊กอัตโนมัติตอนลง TikTok (ดู markPosted/unmarkPosted)
// UpSpace แยกออกมาต่างหาก ไม่ผูกกับ TikTok เลย เพราะเป็นเรื่องสำรองไฟล์ขึ้น Cloud คนละเรื่องกัน
const TODOLIST_STAGE_COLS = { scripts: 6, sounds: 7, footage: 8, final: 9 };
const TODOLIST_UPSPACE_COL = 14; // N: สำรองไฟล์ขึ้น Cloud แล้ว
const TODOLIST_ALL_STAGE_COLS = Object.assign({}, TODOLIST_STAGE_COLS, { upspace: TODOLIST_UPSPACE_COL });
function setStage(sheet, p) {
  const col = TODOLIST_ALL_STAGE_COLS[p.stage];
  if (!col) return json({ ok: false, error: 'UNKNOWN_STAGE' });
  const rowNum = resolveTodolistRow(sheet, p);
  if (!rowNum) return json({ ok: false, error: 'ROW_NOT_FOUND' });
  sheet.getRange(rowNum, col).setValue(!!p.value);
  return json({ ok: true });
}

// ---- ติ๊กว่าลงคลิปแล้ว (จากปุ่มในหน้าเว็บ แท็บ 📅 คิวคลิป) ----
// tiktok: ติ๊ก tiktok+List, ติ๊ก Scripts/Sounds/Footage/Final ให้ครบ, บันทึกลิงก์ลง Link tiktok(O),
//         sync EP เข้า ListITME + Final ใน ⚡️Progress (ตัวเดียวที่ผูกกับ "ลงแล้วจริง")
// sp (Shopee): ติ๊ก sp + บันทึกลิงก์จริงลง Link Shopee(P) (ทับคำว่า "ร่าง" ถ้ามีค้างอยู่)
//              ไม่แตะ List, ไม่ติ๊ก Scripts/Sounds/Footage/Final, ไม่ sync EP ที่ไหนเลยทั้งสิ้น (ตามที่พี่แยมสั่งไว้ตรงๆ)
function markPosted(sheet, p) {
  const platformCol = { tiktok: TODOLIST_TIKTOK_COL, sp: TODOLIST_SP_COL }[p.platform];
  if (!platformCol) return json({ ok: false, error: 'UNKNOWN_PLATFORM' });
  const rowNum = resolveTodolistRow(sheet, p);
  if (!rowNum) return json({ ok: false, error: 'ROW_NOT_FOUND' });

  sheet.getRange(rowNum, platformCol).setValue(true);

  if (p.platform === 'tiktok') {
    sheet.getRange(rowNum, TODOLIST_LIST_COL).setValue(true);
    Object.keys(TODOLIST_STAGE_COLS).forEach(function (stage) {
      sheet.getRange(rowNum, TODOLIST_STAGE_COLS[stage]).setValue(true);
    });
    if (p.link) sheet.getRange(rowNum, TODOLIST_LINK_COL).setValue(p.link);

    const itemText = String(sheet.getRange(rowNum, TODOLIST_ITEM_COL).getValue() || '');
    const epText = String(sheet.getRange(rowNum, TODOLIST_EP_COL).getValue() || '');
    const itmMatch = itemText.match(/ITM[_\s]?\d+/i);
    const epNum = parseFloat(epText.replace(/EP\.?/i, '').trim());
    if (itmMatch && !isNaN(epNum)) {
      const itmCode = itmMatch[0].toUpperCase().replace(/\s/g, '_');
      syncEpToListItme(itmCode, epNum);
      syncProgress(itmCode, 'final', epNum);
      // ลง TikTok EP.X แปลว่างานสเตจก่อนหน้ามาแล้วอย่างน้อยถึง EP.X — ถ้าสเตจไหนยังตามหลังอยู่ ให้ปรับตามทันที
      // ⚡️Progress ปรับครบ Scripts/Sounds/Footage/Draft (syncProgress เดินหน้าอย่างเดียวอยู่แล้ว)
      // 🗂️ ListITME มีแค่คอลัมน์ Footage/Draft เท่านั้น (ไม่มี Scripts/Sounds ในชีตนี้) จึงปรับแค่ 2 ตัวนี้ (guard เพิ่มไม่ให้ถอยหลัง)
      // ตั้งใจไม่ผูกกับ unmarkPosted — ยกเลิกลงคลิปแล้วไม่ปรับสเตจเหล่านี้ย้อนกลับ
      syncProgress(itmCode, 'scripts', epNum);
      syncProgress(itmCode, 'sounds', epNum);
      syncProgress(itmCode, 'footage', epNum);
      syncProgress(itmCode, 'draft', epNum);
      syncListItmeStageIfBehind(itmCode, 'footage', epNum);
      syncListItmeStageIfBehind(itmCode, 'draft', epNum);
    }
  } else if (p.platform === 'sp') {
    if (p.link) sheet.getRange(rowNum, TODOLIST_SP_LINK_COL).setValue(p.link);
  }

  return json({ ok: true });
}

// ---- ปุ่ม "ร่าง" ในโมดัลลิงก์ Shopee (แท็บคิวคลิป) ----
// ไม่แตะ sp(K) เลย และไม่มีสีพื้นหลังพิเศษอะไรทั้งนั้น — แค่เขียนคำว่า "ร่าง" ลงช่อง Link Shopee(P) เป็นตัวจำสถานะ
// กด "ร่าง" ซ้ำ (เลิกร่าง) จะล้างข้อความ "ร่าง" ออก กลับเป็นช่องว่างเหมือนเดิม
const SHOPEE_DRAFT_TEXT = 'ร่าง';
function toggleShopeeDraft(sheet, p) {
  const rowNum = resolveTodolistRow(sheet, p);
  if (!rowNum) return json({ ok: false, error: 'ROW_NOT_FOUND' });
  sheet.getRange(rowNum, TODOLIST_SP_LINK_COL).setValue(p.currentlyDraft ? '' : SHOPEE_DRAFT_TEXT);
  return json({ ok: true });
}

// ---- ปุ่ม "ไม่มีลิงก์" ในโมดัลลิงก์ Shopee (แท็บคิวคลิป) ----
// สำหรับไอเทมที่ไม่ได้ขายบน Shopee เลย — ทำให้ K(sp) กลายเป็นช่องว่างจริงๆ (ไม่มี checkbox) เหมือนแถวที่ไม่เคย
// ใส่ checkbox ไว้แต่แรก ไม่ใช่แค่ FALSE เว็บจะได้โชว์เป็นข้อความเฉยๆ ไม่ใช่ปุ่มให้กด
// กดปุ่มเดิมซ้ำอีกรอบ (ตอนนี้ label จะเปลี่ยนเป็น "ยกเลิกไม่มีลิงก์") จะเรียก restoreShopeeCheckbox ด้านล่างแทน
function markNoShopeeLink(sheet, p) {
  const rowNum = resolveTodolistRow(sheet, p);
  if (!rowNum) return json({ ok: false, error: 'ROW_NOT_FOUND' });
  const cell = sheet.getRange(rowNum, TODOLIST_SP_COL);
  cell.setDataValidation(null);
  cell.setValue('');
  sheet.getRange(rowNum, TODOLIST_SP_LINK_COL).setValue('');
  return json({ ok: true });
}

// ---- ปุ่ม "ยกเลิกไม่มีลิงก์" (สลับ label เดียวกับปุ่ม "ไม่มีลิงก์" ด้านบน เมื่อไอเทมอยู่ในสถานะไม่มีลิงก์แล้ว) ----
// คืน checkbox กลับเข้าไปที่ K เหมือนแถวปกติทั่วไป แล้วตั้งเป็นยังไม่ติ๊ก (FALSE) — สลับกับ markNoShopeeLink ด้านบน
function restoreShopeeCheckbox(sheet, p) {
  const rowNum = resolveTodolistRow(sheet, p);
  if (!rowNum) return json({ ok: false, error: 'ROW_NOT_FOUND' });
  const cell = sheet.getRange(rowNum, TODOLIST_SP_COL);
  cell.setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
  cell.setValue(false);
  return json({ ok: true });
}

// ---- แก้ไขลิงก์ที่บันทึกไว้แล้ว (จากป็อปอัปกดที่ป้าย 🔗ลิงก์ ในคิวคลิป) ----
// ไม่แตะสถานะติ๊ก/EP อะไรเลย แค่เขียนทับข้อความลิงก์อย่างเดียว
function updatePostLink(sheet, p) {
  const linkCol = p.platform === 'tiktok' ? TODOLIST_LINK_COL : TODOLIST_SP_LINK_COL;
  const rowNum = resolveTodolistRow(sheet, p);
  if (!rowNum) return json({ ok: false, error: 'ROW_NOT_FOUND' });
  sheet.getRange(rowNum, linkCol).setValue(p.link || '');
  return json({ ok: true });
}

// ---- ปุ่ม "ยังไม่ได้ลงคลิป" ในป็อปอัปลิงก์ — ย้อนสถานะกลับเป็นยังไม่ลง ----
// tiktok: เลิกติ๊ก tiktok/List/Scripts/Sounds/Footage/Final ทั้งหมด เคลียร์ลิงก์ แล้วลด EP ใน
//         ListITME กับ Final ใน ⚡️Progress ลง 1 (ไม่มีประวัติค่าเก่าเก็บไว้ เลยลดคงที่ทีละ 1 ตามที่พี่แยมเลือก)
// sp (Shopee): เลิกติ๊ก sp + เคลียร์ลิงก์เท่านั้น ไม่แตะ EP ที่ไหนเลย (Shopee ไม่เคยยุ่งกับ EP อยู่แล้ว)
function unmarkPosted(sheet, p) {
  const platformCol = { tiktok: TODOLIST_TIKTOK_COL, sp: TODOLIST_SP_COL }[p.platform];
  if (!platformCol) return json({ ok: false, error: 'UNKNOWN_PLATFORM' });
  const rowNum = resolveTodolistRow(sheet, p);
  if (!rowNum) return json({ ok: false, error: 'ROW_NOT_FOUND' });

  sheet.getRange(rowNum, platformCol).setValue(false);
  const linkCol = p.platform === 'tiktok' ? TODOLIST_LINK_COL : TODOLIST_SP_LINK_COL;
  sheet.getRange(rowNum, linkCol).setValue('');

  if (p.platform === 'tiktok') {
    sheet.getRange(rowNum, TODOLIST_LIST_COL).setValue(false);
    Object.keys(TODOLIST_STAGE_COLS).forEach(function (stage) {
      sheet.getRange(rowNum, TODOLIST_STAGE_COLS[stage]).setValue(false);
    });

    const itemText = String(sheet.getRange(rowNum, TODOLIST_ITEM_COL).getValue() || '');
    const itmMatch = itemText.match(/ITM[_\s]?\d+/i);
    if (itmMatch) {
      const itmCode = itmMatch[0].toUpperCase().replace(/\s/g, '_');
      decrementListItmeEp(itmCode);
      decrementProgressFinal(itmCode);
    }
  }

  return json({ ok: true });
}

function decrementListItmeEp(itmCode) {
  const listSheet = SS.getSheetByName(LISTITME_SHEET);
  if (!listSheet) return;
  const values = listSheet.getDataRange().getValues();
  for (let r = 0; r < values.length; r++) {
    const cellText = String(values[r][LISTITME_NAME_COL - 1] || '').toUpperCase().replace(/\s/g, '_');
    if (cellText.indexOf(itmCode) === -1) continue;
    const cell = listSheet.getRange(r + 1, LISTITME_EP_COL);
    const cur = parseFloat(String(cell.getValue() || '').replace(/EP\.?/i, '').trim());
    if (!isNaN(cur)) cell.setValue(Math.max(cur - 1, 0));
    return;
  }
}

function decrementProgressFinal(itmCode) {
  const progSheet = SS.getSheetByName(PROGRESS_SHEET);
  if (!progSheet) return;
  const values = progSheet.getDataRange().getValues();
  for (let r = 1; r < values.length; r++) {
    const cellText = String(values[r][0] || '').toUpperCase().replace(/\s/g, '_');
    if (cellText.indexOf(itmCode) === -1) continue;
    const cell = progSheet.getRange(r + 1, PROGRESS_COLS.final);
    const cur = parseFloat(String(cell.getValue() || '').replace(/EP\.?/i, '').trim());
    if (!isNaN(cur)) cell.setValue('EP.' + Math.max(cur - 1, 0));
    return;
  }
}

// ---- อัปเดต EP ล่าสุดของสเตจนั้นๆ ในชีต ⚡️Progress ----
// เดินหน้าอย่างเดียว (ไม่เขียนทับด้วยเลข EP ที่น้อยกว่าค่าเดิม กันข้อมูลถอยหลัง)
const PROGRESS_SHEET = '⚡️Progress';
const PROGRESS_COLS = { scripts: 2, sounds: 3, footage: 4, draft: 5, final: 6 };
function syncProgress(itmCode, stage, epNum) {
  const col = PROGRESS_COLS[stage];
  if (!col) return;
  const sheet = SS.getSheetByName(PROGRESS_SHEET);
  if (!sheet) return;
  const names = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  for (let r = 1; r < names.length; r++) {
    const cellText = String(names[r][0] || '').toUpperCase().replace(/\s/g, '_');
    if (cellText.indexOf(itmCode) === -1) continue;
    const cell = sheet.getRange(r + 1, col);
    const cur = parseFloat(String(cell.getValue() || '').replace(/EP\.?/i, '').trim());
    if (isNaN(cur) || epNum >= cur) cell.setValue('EP.' + epNum);
    return;
  }
}

// ---- แก้ไขค่า EP ใน ⚡️Progress ด้วยมือ (จากหน้า ✍️ กรอก Progress — กดปุ่ม "บันทึก" ต่อแถว) ----
// รับค่าทั้งแถวมาทีเดียว (scripts/sounds/footage/draft) เขียนเฉพาะช่องที่มีค่าส่งมา ไม่แตะช่องที่เว้นว่าง
// ไม่กันถอยหลังเหมือน syncProgress เพราะพี่แยมแก้เองตั้งใจ อาจต้องแก้ค่าย้อนกลับได้ตามจริง
// Final ห้ามแก้จากหน้านี้ — sync อัตโนมัติจากปุ่ม "ลง TikTok" เท่านั้น (ไม่รับค่ามาแม้จะส่งมา)
// หา row จากรหัส ITM สดๆ ทุกครั้ง (ไม่เชื่อเลขแถวที่แคชไว้ฝั่งเว็บ) — กันเขียนผิดแถวถ้าเผลอแทรก/ลบแถวในชีตระหว่างเปิดหน้าเว็บค้างไว้
const PROGRESS_EDITABLE_STAGES = ['scripts', 'sounds', 'footage', 'draft'];
function setProgressRow(sheet, p) {
  const itmCode = String(p.itmCode || '').toUpperCase().replace(/\s/g, '_');
  if (!itmCode) return json({ ok: false, error: 'MISSING_ITM_CODE' });
  const values = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  let rowNum = 0;
  for (let r = 1; r < values.length; r++) { // ข้ามแถวหัว
    const cellText = String(values[r][0] || '').toUpperCase().replace(/\s/g, '_');
    if (cellText.indexOf(itmCode) !== -1) { rowNum = r + 1; break; }
  }
  if (!rowNum) return json({ ok: false, error: 'ITEM_NOT_FOUND' });

  PROGRESS_EDITABLE_STAGES.forEach(function (stage) {
    if (p[stage] === undefined || p[stage] === '' || p[stage] === null) return;
    const epNum = parseFloat(p[stage]);
    if (isNaN(epNum)) return;
    sheet.getRange(rowNum, PROGRESS_COLS[stage]).setValue('EP.' + epNum);
    if (LISTITME_STAGE_COLS[stage]) syncListItmeStage(itmCode, stage, epNum);
  });
  return json({ ok: true });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// เติมประเภทสินค้าลงคอลัมน์ B ของชีต 🍊🔗ShopeeLink (รันครั้งเดียว)
// - แถวหัว (แถว 1) จะใส่คำว่า "ประเภทสินค้า"
// - แถวที่มีประเภทอยู่แล้ว จะไม่เขียนทับ (แก้มือได้ตามใจ)
// - เดาจากชื่อสินค้า + คำอธิบาย ถ้าเดาไม่ได้จะใส่ "อื่นๆ"
// ============================================================
function fillCategories() {
  const sheet = SS.getSheetByName('🍊🔗ShopeeLink');
  if (!sheet) throw new Error('ไม่พบชีต 🍊🔗ShopeeLink');
  // ดึงคำอธิบายมาช่วยเดา
  const descMap = {};
  const descSheet = SS.getSheetByName('📝#คำอธิบาย');
  if (descSheet) descSheet.getDataRange().getValues().forEach(function (r) {
    const m = String(r[0] || '').match(/^(ITM[_\s]?\d+)/i);
    if (m) descMap[m[1].toUpperCase().replace(/\s/g, '')] = String(r[1] || '');
  });
  const values = sheet.getDataRange().getValues();
  const out = values.map(function (r, i) {
    const m = String(r[0] || '').trim().match(/^(ITM[_\s]?\d+)\s*(.*)$/i);
    if (!m) return [i === 0 ? 'ประเภทสินค้า' : (r[1] || '')];
    if (String(r[1] || '').trim()) return [r[1]]; // มีอยู่แล้ว ไม่ทับ
    const id = m[1].toUpperCase().replace(/\s/g, '');
    return [guessCategory(m[2] + ' ' + (descMap[id] || ''))];
  });
  sheet.getRange(1, 2, out.length, 1).setValues(out);
}

function guessCategory(text) {
  const t = String(text || '').toLowerCase();
  const has = function (re) { return re.test(t); };
  if (has(/คีย์แคป|keycap/)) return 'คีย์แคป';
  if (has(/แผ่นรองเมาส์|แผ่นรองข้อมือ|ที่รองข้อมือ|ที่รองเมาส์|ที่รองคีย์บอร์ด/)) return 'แผ่นรองเมาส์';
  if (has(/คีย์บอร์ด|keyboard|แป้นพิม|แป้นน้ำแข็ง/)) return 'คีย์บอร์ด';
  if (has(/เมาส์|mouse/)) return 'เมาส์';
  if (has(/ชุดชาร์จ/)) return 'ชุดชาร์จ';
  if (has(/หัวชาร์จ|อะแดปเตอร์ชาร์จ/)) return 'หัวชาร์จ';
  if (has(/สายชาร์จ|สายไทป์/)) return 'สายชาร์จ';
  if (has(/พาวเวอร์แบงค์|powerbank/)) return 'พาวเวอร์แบงค์';
  if (has(/usb ?hub|ยูเอสบี|ฮับ|การ์ดรีดเดอร์/)) return 'ยูเอสบี ฮับ';
  if (has(/พัดลม/)) return 'พัดลม';
  if (has(/กระเป๋า/) && has(/ไอแพด|โน๊ตบุ๊|โน้ตบุ๊|แล็ปท็อป|แล็บท็อป|macbook/)) return 'กระเป๋าใส่ไอแพด';
  if (has(/โน๊ตบุ๊|โน้ตบุ๊/) && has(/แท่น|ที่วาง|ขาตั้ง/)) return 'แท่นวางโน๊ตบุ๊ค';
  if (has(/หูฟัง|ลำโพง|ปากกา|สไตลัส|ขาตั้ง|แท่นวาง|ที่วาง|เคส|สมาร์ทวอ|นาฬิกา|ไม้เซลฟี่|วงแหวน|ไฟ|ปลั๊ก/)) return 'อุปกรณ์เสริม';
  return 'อื่นๆ';
}

// ============================================================
// Sync EP อัตโนมัติ: ติ๊กคอลัมน์ "List" ในชีต TODOLIST-xxx
// → อัปเดตค่า EP ของสินค้าตัวนั้นในชีต 🗂️ ListITME ให้ตรงกัน
// เป็น simple trigger (onEdit) ทำงานทันทีตอนติ๊ก ไม่ต้อง Deploy ใหม่
// ============================================================
const TODOLIST_ITEM_COL = 3;   // C: ชื่อสินค้า (มีรหัส ITM_xxx ฝังอยู่)
const TODOLIST_EP_COL = 4;     // D: EP เช่น "EP.35"
const TODOLIST_TIKTOK_COL = 10; // J: checkbox "tiktok"
const TODOLIST_SP_COL = 11;     // K: checkbox "sp" (Shopee)
const TODOLIST_LIST_COL = 13;  // M: checkbox "List"
const TODOLIST_LINK_COL = 15;  // O: ลิงก์คลิปที่ลงจริง (กรอกตอนกดปุ่ม "ลง TikTok แล้ว" ในคิวคลิป)
const TODOLIST_SP_LINK_COL = 16; // P: ลิงก์ Shopee (พี่แยมตั้งหัวคอลัมน์ "Link Shopee" ไว้แล้ว) — ใช้เก็บคำว่า "ร่าง" ตอนยังไม่มีลิงก์จริงด้วย

// ⚠️ 2026-07-14: พี่แยมรวมชีต ListITME จาก 3 บล็อก A/B/C ข้างกัน เป็นตารางเดียวยาวลงมาแล้ว
// พร้อมเพิ่มคอลัมน์ Footage (E) กับ Draft (F) — โครงสร้างใหม่: B=ชื่อ, C=EP ปัจจุบัน, D=Tier, E=Footage, F=Draft
const LISTITME_SHEET = '🗂️ ListITME';
const LISTITME_NAME_COL = 2;
const LISTITME_EP_COL = 3;
const LISTITME_STAGE_COLS = { footage: 5, draft: 6 };

function onEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName().indexOf('TODOLIST') === -1) return;
  if (e.range.getColumn() !== TODOLIST_LIST_COL) return;
  if (e.value !== 'TRUE') return; // sync เฉพาะตอนติ๊กเข้า ไม่ทำตอนติ๊กออก

  const row = e.range.getRow();
  const itemText = String(sheet.getRange(row, TODOLIST_ITEM_COL).getValue() || '');
  const epText = String(sheet.getRange(row, TODOLIST_EP_COL).getValue() || '');

  const itmMatch = itemText.match(/ITM[_\s]?\d+/i);
  const epNum = parseFloat(epText.replace(/EP\.?/i, '').trim());
  if (!itmMatch || isNaN(epNum)) return; // ข้อมูลไม่ครบ ข้ามไป ไม่ sync มั่ว

  const itmCode = itmMatch[0].toUpperCase().replace(/\s/g, '_');
  syncEpToListItme(itmCode, epNum);
}

function syncEpToListItme(itmCode, epNum) {
  const listSheet = SS.getSheetByName(LISTITME_SHEET);
  if (!listSheet) return;
  const values = listSheet.getDataRange().getValues();
  for (let r = 0; r < values.length; r++) {
    const cellText = String(values[r][LISTITME_NAME_COL - 1] || '').toUpperCase().replace(/\s/g, '_');
    if (cellText.indexOf(itmCode) === -1) continue;
    listSheet.getRange(r + 1, LISTITME_EP_COL).setValue(epNum);
    return;
  }
}

// ---- sync ค่า Footage/Draft จากหน้า ✍️ กรอก Progress เข้าคอลัมน์เดียวกันใน ListITME ----
// เขียนตรงๆ ไม่กันถอยหลัง (พี่แยมกรอกเองตั้งใจ เหมือน setProgressRow)
function syncListItmeStage(itmCode, stage, epNum) {
  const col = LISTITME_STAGE_COLS[stage];
  if (!col) return;
  const listSheet = SS.getSheetByName(LISTITME_SHEET);
  if (!listSheet) return;
  const values = listSheet.getDataRange().getValues();
  for (let r = 0; r < values.length; r++) {
    const cellText = String(values[r][LISTITME_NAME_COL - 1] || '').toUpperCase().replace(/\s/g, '_');
    if (cellText.indexOf(itmCode) === -1) continue;
    listSheet.getRange(r + 1, col).setValue('EP.' + epNum); // เขียนเป็น "EP.X" ให้ตรงรูปแบบเดียวกับ ⚡️Progress
    return;
  }
}

// ---- เหมือน syncListItmeStage แต่เดินหน้าอย่างเดียว (ไม่เขียนทับด้วยเลขน้อยกว่าค่าเดิม) ----
// ใช้ตอนลง TikTok เพื่อดัน Footage/Draft ตามให้ทัน EP ที่เพิ่งลง โดยไม่ทำลายค่าที่พี่แยมกรอกเองไว้ล่วงหน้าแล้ว (เช่น กรอก Footage ไว้ล่วงหน้าเกิน EP ที่ลงจริง)
function syncListItmeStageIfBehind(itmCode, stage, epNum) {
  const col = LISTITME_STAGE_COLS[stage];
  if (!col) return;
  const listSheet = SS.getSheetByName(LISTITME_SHEET);
  if (!listSheet) return;
  const values = listSheet.getDataRange().getValues();
  for (let r = 0; r < values.length; r++) {
    const cellText = String(values[r][LISTITME_NAME_COL - 1] || '').toUpperCase().replace(/\s/g, '_');
    if (cellText.indexOf(itmCode) === -1) continue;
    const cell = listSheet.getRange(r + 1, col);
    const cur = parseFloat(String(cell.getValue() || '').replace(/EP\.?/i, '').trim());
    if (isNaN(cur) || epNum >= cur) cell.setValue('EP.' + epNum);
    return;
  }
}

// ---- รันครั้งเดียว: ใส่ dropdown (1–100) ให้คอลัมน์ Footage/Draft ใน 🗂️ ListITME ----
// เลือกฟังก์ชัน setupListItmeDropdowns แล้วกด Run ในหน้า Apps Script (เหมือน setup/fillCategories)
// ปรับเลข 100 ท้ายๆ ได้ถ้าอยากได้ช่วงกว้าง/แคบกว่านี้ — ทำเป็นลิสต์คงที่ทั้งคอลัมน์ (ไม่ไล่ตามค่าปัจจุบันทีละแถวแบบในเว็บ
// เพราะ Google Sheets data validation ทำแบบนั้นในตัวไม่ได้ ต้องใช้ช่วงเดียวกันทั้งคอลัมน์)
function setupListItmeDropdowns() {
  const sheet = SS.getSheetByName(LISTITME_SHEET);
  if (!sheet) throw new Error('ไม่พบชีต ' + LISTITME_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const values = [];
  for (let n = 1; n <= 100; n++) values.push('EP.' + n); // "EP.X" ให้ตรงรูปแบบเดียวกับ ⚡️Progress
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
  sheet.getRange(2, LISTITME_STAGE_COLS.footage, lastRow - 1, 1).setDataValidation(rule);
  sheet.getRange(2, LISTITME_STAGE_COLS.draft, lastRow - 1, 1).setDataValidation(rule);
}

// ---- รันครั้งเดียว: ก็อปค่า Footage/Draft ที่มีอยู่แล้วใน ⚡️Progress เข้า 🗂️ ListITME ให้ตรงกัน ----
// (ใช้แก้ปัญหาข้อมูลเก่าก่อนที่จะมีการ sync อัตโนมัติ — เชื่อมอัตโนมัติทำงานเฉพาะการแก้ไขครั้งใหม่ๆ เท่านั้น)
function backfillListItmeFromProgress() {
  const progSheet = SS.getSheetByName(PROGRESS_SHEET);
  if (!progSheet) throw new Error('ไม่พบชีต ' + PROGRESS_SHEET);
  const rows = progSheet.getDataRange().getValues();
  let count = 0;
  for (let r = 1; r < rows.length; r++) { // ข้ามแถวหัว
    const itemText = String(rows[r][0] || '');
    const itmMatch = itemText.match(/ITM[_\s]?\d+/i);
    if (!itmMatch) continue;
    const itmCode = itmMatch[0].toUpperCase().replace(/\s/g, '_');
    ['footage', 'draft'].forEach(function (stage) {
      const raw = String(rows[r][PROGRESS_COLS[stage] - 1] || '');
      const epNum = parseFloat(raw.replace(/EP\.?/i, '').trim());
      if (isNaN(epNum)) return;
      syncListItmeStage(itmCode, stage, epNum);
      count++;
    });
  }
  Logger.log('Backfilled ' + count + ' ค่าเข้า ListITME');
}

// ============================================================
// Progress-Day: แท็บ "📆 Progress-Day" กดนับ +1/-1 รายวัน (สคริปต์/เสียง/ถ่าย/Draft/Final/ลงคลิป)
// ชื่อชีตมีเว้นวรรคท้ายจริง ("Progress-Day ") ห้ามลบออก ไม่งั้นหาชีตไม่เจอ
// คอลัมน์ A เป็น Date object จริง (โชว์เป็น "1 July 2026") ไม่ใช่ข้อความ
// ============================================================
const PROGRESS_DAY_SHEET = 'Progress-Day ';
const PROGRESS_DAY_STAGE_COLS = { scripts: 2, sounds: 3, footage: 4, draft: 5, final: 6, posted: 7 };

function findProgressDayRow(sheet, dateStr) {
  const lastRow = sheet.getLastRow();
  const values = sheet.getRange(1, 1, lastRow, 1).getValues();
  for (let r = 0; r < values.length; r++) {
    const v = values[r][0];
    if (v instanceof Date && Utilities.formatDate(v, 'Asia/Bangkok', 'yyyy-MM-dd') === dateStr) return r + 1;
  }
  return 0;
}

// p: { date: 'yyyy-MM-dd', stage: 'scripts'|'sounds'|'footage'|'draft'|'final'|'posted', delta: 1 หรือ -1 }
// ไม่มีแถวของวันนั้น (เช่น ข้ามเข้าเดือนใหม่ที่ยังไม่ได้เตรียมแถวไว้) → สร้างแถวใหม่ให้อัตโนมัติ
function bumpProgressDay(sheet, p) {
  const col = PROGRESS_DAY_STAGE_COLS[p.stage];
  if (!col) return json({ ok: false, error: 'UNKNOWN_STAGE' });
  let rowNum = findProgressDayRow(sheet, p.date);
  if (!rowNum) {
    sheet.appendRow([new Date(p.date + 'T00:00:00')]);
    rowNum = sheet.getLastRow();
  }
  const cell = sheet.getRange(rowNum, col);
  const cur = parseFloat(cell.getValue()) || 0;
  const next = Math.max(0, cur + (p.delta || 1));
  cell.setValue(next);
  return json({ ok: true, value: next });
}

// ---- รันครั้งเดียว: ใส่สูตรคอลัมน์ G/H ใน 🗂️ ListITME ----
// G = Footage เหลือ (Footage − EP ปัจจุบัน) = ถ่ายแล้วแต่ยังไม่ตัด Draft
// H = Draft เหลือ (Draft − EP ปัจจุบัน) = ตัด Draft แล้วแต่ยังไม่ Final/โพสต์
// เป็นสูตรจริง (ไม่ใช่ค่าคงที่) อัปเดตอัตโนมัติเองทุกครั้งที่ EP/Footage/Draft เปลี่ยน ไม่ต้องรันซ้ำ
// เลือกฟังก์ชัน fillListItmeRemaining แล้วกด Run ในหน้า Apps Script (เหมือน setup/fillCategories)
function fillListItmeRemaining() {
  const sheet = SS.getSheetByName(LISTITME_SHEET);
  if (!sheet) throw new Error('ไม่พบชีต ' + LISTITME_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  sheet.getRange(1, 7).setValue('Footage เหลือ');
  sheet.getRange(1, 8).setValue('Draft เหลือ');
  for (let r = 2; r <= lastRow; r++) {
    sheet.getRange(r, 7).setFormula('=IFERROR(VALUE(SUBSTITUTE(E' + r + ',"EP.",""))-C' + r + ',"")');
    sheet.getRange(r, 8).setFormula('=IFERROR(VALUE(SUBSTITUTE(F' + r + ',"EP.",""))-C' + r + ',"")');
  }
}
