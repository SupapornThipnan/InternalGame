# CLAUDE.md — Demetria Spirit

คู่มือสถาปัตยกรรมโค้ดสำหรับ Claude Code
**อ่าน `GAME_DESIGN.md` ก่อนเสมอ** เพื่อเข้าใจว่ากำลังทำเกมอะไร แล้วค่อยกลับมาไฟล์นี้

---

## ผู้ใช้

**พี่แยม (YamuJung)** — เกมดีไซเนอร์ ไม่ใช่โปรแกรมเมอร์
- อธิบายเป็นภาษาไทย ภาษาคน ไม่โยน jargon
- ตอบสั้น กระชับ สรุปงาน 2–3 ประโยคพอ
- ส่งมอบของที่ **เปิดใช้ได้เลย** ดับเบิลคลิกแล้วเล่นได้ทันที

---

## โครงสร้างโปรเจกต์

```
[indiebear STD] NongCoco-เกมดีไซน์/
├── GAME_DESIGN.md              ← ดีไซน์เกม gameplay สมดุล ศิลป์ (อ่านก่อน)
├── CLAUDE.md                   ← ไฟล์นี้ — สถาปัตยกรรมโค้ด
│
├── eco_demo.html               ← [v0.7.1] Prototype ระบบเศรษฐกิจ (ไม่มีแมพ)
├── eco_demo_changelog.md
│
├── demetria_world.html         ← [v1.2.0] เกมไอโซเมตริกเดินได้จริง
└── demetria_world_changelog.md
```

ทั้งสองไฟล์เป็น **single-file HTML** (HTML + CSS + Vanilla JS ในไฟล์เดียว)
ไม่มี build step ไม่มี dependency ไม่ต้องลง npm — เปิดด้วย browser ได้เลย

**ห้ามแตกเป็นหลายไฟล์ หรือใส่ framework/bundler** โดยไม่ถามพี่แยมก่อน
ข้อจำกัดนี้ตั้งใจ เพราะพี่แยมต้องเปิดไฟล์เองได้โดยไม่ต้องติดตั้งอะไร

---

## ไฟล์ที่ 1: `eco_demo.html` — ECO System Prototype

**หน้าที่:** ทดสอบสมดุลเศรษฐกิจล้วนๆ ไม่มีแมพ ไม่มีตัวละคร
เป็นการ์ด 63 ใบเรียงกัน กดปลูก/คราฟ/ปลดล็อคได้

**นี่คือ source of truth ของข้อมูลเกม** — ถ้าจะแก้ข้อมูลด่าน แก้ที่นี่ก่อน

### โครงสร้างข้อมูลหลัก

```js
const ITEMS = { 'ข้าวสาลี':'🌾', 'แครอท':'🥕', ... }   // 186 ไอเทม → emoji

const ZONE_META = {
  center:{emoji:'🏰',label:'เมืองหลวง',color:'#f0d880'},
  north:{...}, east:{...}, south:{...}, west:{...}
};

const DEF = [ /* 63 stage objects เรียงตามลำดับปลดล็อค */ ];
```

### Schema ของ stage

```js
// Passive stage — ปลูก/เลี้ยง แล้วเก็บเกี่ยว
{
  id:'farm_a',              // unique, snake_case
  wave:1,                   // 1–11
  cat:'farm',               // farm | animal | forest | craft
  zone:'east',              // center | north | east | south | west
  name:'ฟาร์มพืชผัก',        // ภาษาไทย
  type:'passive',
  emoji:'🌾',
  accent:'#3d7d2a',         // สีธีมการ์ด/อาคาร
  unlocked:true,            // 3 ด่านแรกเท่านั้นที่ true
  growDays:1,               // กี่วันถึงเก็บเกี่ยวได้
  amount:3,                 // ได้กี่ชิ้นต่อผลผลิต 1 ชนิด
  produces:['ข้าวสาลี','แครอท','หอม'],   // 3 ชนิดเสมอ
  unlockCost:null,          // หรือ { 'ไอเทม': จำนวน, ... }
}

// Craft stage — ร้าน NPC
{
  id:'npc_bread', wave:1, cat:'craft', zone:'center',
  name:'ร้านขนมปัง', type:'craft', emoji:'🏪', accent:'#6030a0',
  unlocked:false,
  recipes:[
    {name:'ขนมปัง', emoji:'🍞', ing:{'ข้าวสาลี':2,'นม':1}},
    // ปกติ 3 สูตรต่อร้าน
  ],
  unlockCost:{'ข้าวสาลี':8,'ไข่':5,'เบอร์รี่ป่า':5},
}
```

### ฟิลด์ที่ระบบเติมให้อัตโนมัติ — อย่าเขียนมือ

```js
const WAVE_MONEY={1:50,2:300,3:600,4:1200,5:2000,6:3000,
                  7:5000,8:8000,9:12000,10:18000,11:26000};
DEF.forEach((d,i) => {
  d.prereq = i > 0 ? DEF[i-1].id : null;              // chain เส้นตรงตามลำดับ array
  if(!d.unlocked && i > 3) d.moneyCost = WAVE_MONEY[d.wave] || 500;
});
```

> ⚠️ **ลำดับใน `DEF` = ลำดับการปลดล็อคจริง** การแทรกด่านกลาง array
> จะเปลี่ยน prereq ของด่านถัดไปทั้งหมด — ปกติควร **ต่อท้าย** เท่านั้น

---

## ไฟล์ที่ 2: `demetria_world.html` — เกมไอโซเมตริก

**หน้าที่:** เกมจริงที่เดินได้ ใช้ข้อมูล 63 ด่านชุดเดียวกับ eco_demo

### ข้อมูลถูก "คัดลอกฝัง" มา ไม่ได้ import

`ITEMS` / `ZONE_META` / `DEF` ในไฟล์นี้ถูก **extract มาจาก `eco_demo.html`
แล้วฝังเป็น JSON** ตอน build (single-file จึง import ข้ามไฟล์ไม่ได้)

**ถ้าแก้ข้อมูลด่านใน `eco_demo.html` ต้อง sync มาที่นี่ด้วย** ด้วยสคริปต์นี้:

```bash
node -e "
const fs=require('fs');
const html=fs.readFileSync('eco_demo.html','utf8');
const code=html.match(/<script>([\s\S]*)<\/script>/)[1];
const S={};
const stub={addEventListener(){},appendChild(){},textContent:'',style:{},
  classList:{add(){},remove(){},contains(){return false},toggle(){}},innerHTML:'',
  firstChild:{textContent:''}};
new Function('S','document','window','requestAnimationFrame','setInterval',
  'clearInterval','setTimeout','clearTimeout',
  code+';S.ITEMS=ITEMS;S.DEF=DEF;S.ZONE_META=ZONE_META;')
  (S,{getElementById:()=>stub,addEventListener(){},querySelectorAll:()=>[]},
   {addEventListener(){}},()=>{},()=>{},()=>{},()=>{},()=>{});
const clean=S.DEF.map(d=>{
  const o={id:d.id,wave:d.wave,cat:d.cat,zone:d.zone,name:d.name,type:d.type,
           emoji:d.emoji,accent:d.accent,unlocked:!!d.unlocked};
  ['growDays','amount','produces','recipes','unlockCost','moneyCost','prereq']
    .forEach(k=>{ if(d[k]) o[k]=d[k]; });
  return o;
});
console.log('const ITEMS='+JSON.stringify(S.ITEMS)+';');
console.log('const ZONE_META='+JSON.stringify(S.ZONE_META)+';');
console.log('const DEF='+JSON.stringify(clean)+';');
" > /tmp/gamedata.js
# แล้วเอาผลลัพธ์ไปแทนบล็อก const ITEMS/ZONE_META/DEF เดิมใน demetria_world.html
```

### สถาปัตยกรรมภายใน (เรียงตามลำดับในไฟล์)

| ส่วน | หน้าที่ |
|------|--------|
| `CONSTANTS` | `MAP=50` `TW=64` `TH=32` `DAY_SECONDS=60` `PLAYER_SPEED` `ZONES` `TILE_COLORS` |
| `WORLD GEN` | `hash()` `noise2()` `genWorld()` — สร้าง `world[y][x]={zone}` หรือ `null` |
| `STAGE PLACEMENT` | `placeStages()` — วางด่านลงกริดตามโซน เว้นระยะ ไม่ทับกัน → `buildings["x,y"]` |
| `STATE` | object `G` เก็บทุกอย่าง (วัน เวลา เงิน inventory เควส stages player zoom) |
| `ISO MATH` | `toScreen(x,y)` `drawDiamond()` `drawBox()` `shade()` |
| `DAY/NIGHT` | `nightAmount()` 0–1 · `phaseName()` |
| `RENDER` | `render()` วาดพื้น → sort ตาม depth → วาดอาคาร+ผู้เล่น → vignette |
| `MOVEMENT` | `walkable()` `movePlayer()` `findNear()` |
| `GAME LOOP` | `loop()` → move, เดินเวลา, ตรวจวันใหม่, tick เควส, render |
| `GUIDANCE` | `nextUnlockStage()` `updateCompass()` `announceNext()` |
| `PANELS` | inventory + quest (side panel) |
| `QUESTS` | `questPool()` `genQuest()` `submitQuest()` |
| `INTERACTION` | `interact()` `renderModal()` `doPlant/doHarvest/doCraft/doUnlock` |

### Isometric projection

```js
const toScreen=(x,y)=>({ sx:(x-y)*(TW/2), sy:(x+y)*(TH/2) });
// บนจอ:  ขึ้น = (x+y) น้อย   ขวา = (x-y) มาก
// ดังนั้น: เหนือ=(x,y ต่ำทั้งคู่)  ใต้=(สูงทั้งคู่)  ออก=(x สูง,y ต่ำ)  ตก=(x ต่ำ,y สูง)
```

**การเดินแมพ WASD** ถูก map ให้ตรงกับแกนหน้าจอ ไม่ใช่แกนกริด:
```js
if(up)   {dx-=1; dy-=1}    // W = ขึ้นบนจอ
if(down) {dx+=1; dy+=1}
if(left) {dx-=1; dy+=1}
if(right){dx+=1; dy-=1}
```

**Depth sorting** ใช้ `x+y` — วาดจากน้อยไปมาก ของที่อยู่หลังถูกวาดก่อน

**Zoom** ใช้ canvas transform:
```js
ctx.translate(W/2,H/2); ctx.scale(z,z); ctx.translate(-p.sx,-p.sy);
// การแปลงกลับ (คลิกเมาส์ → พิกัดโลก):
const mx=(e.clientX-innerWidth/2)/G.zoom+G.cam.x;
```

### กฎสำคัญของเกมไอโซ

1. **ต้องเดินไปถึงก่อนถึงจะกดทำอะไรได้** — `nearEnough()` ถูกเช็คใน
   `doPlant` / `doHarvest` / `doCraft` / `doUnlock` ทั้งหมด
   (เพราะเข็มทิศเปิด modal ของด่านไกลๆ ได้ ต้องกันไม่ให้ทำงานจริง)
2. **ระบบนำทางอาศัย chain เส้นตรง** — `nextUnlockStage()` คือ
   `G.stages.find(s=>!s.unlocked)` ถ้าเปลี่ยนเป็น branching ต้องเขียนใหม่
3. **ผู้เล่นสปอนติดด่านแรก** — `G.player` ตั้งค่าจาก `G.stages[0].gx/gy`
4. **`buildings` เป็น collision** — เดินทับไม่ได้ ต้องมีทางเดินรอบทุกด่าน

---

## Workflow เวลาแก้งาน

### ทุกครั้งที่แก้
1. **อ่านไฟล์ปัจจุบันก่อน** — อย่าเขียนทับใหม่หมด แก้แบบ incremental
2. แก้เฉพาะจุด
3. **ตรวจ syntax** (บังคับ ห้ามข้าม):
   ```bash
   node -e "
   const fs=require('fs');
   const h=fs.readFileSync('demetria_world.html','utf8');
   new Function(h.match(/<script>([\s\S]*)<\/script>/)[1]);
   console.log('syntax OK');
   "
   ```
4. **ขยับเลขเวอร์ชั่น** ที่ badge ใน HTML
5. **เขียน changelog entry** ที่ไฟล์ `*_changelog.md` ที่คู่กัน (entry ใหม่อยู่บนสุด
   ต่อท้ายหัวข้อด้วย `✅ (ล่าสุด)` และลบ `(ล่าสุด)` ออกจาก entry เดิม)
6. สรุปให้พี่แยม 2–3 ประโยค

### เวลาเพิ่ม/แก้ด่าน — ต้องรัน sanity check
```bash
# ตรวจว่า: ไม่มี id ซ้ำ, ทุก item ที่อ้างถึงมีอยู่ใน ITEMS จริง,
#          ทุกด่านวางลงกริดได้ ไม่ทับกัน และเดินถึงได้ทุกด่าน
```
เช็คลิสต์ที่ต้องผ่าน:
- [ ] ไม่มี `id` ซ้ำ
- [ ] ทุกชื่อไอเทมใน `produces` / `recipes` / `unlockCost` มีคีย์ใน `ITEMS`
- [ ] ทุกด่านมี `zone` และวางบน tile ของโซนตัวเอง
- [ ] flood-fill จากจุดสปอนเดินถึงทุกด่าน (ไม่มีด่านโดนขัง)
- [ ] `new Function(...)` ผ่าน (syntax)

### เวลาแก้ระบบเควส — ห้ามพังกฎนี้
เควสต้องไม่ขอของที่ผู้เล่นยังทำไม่ได้ `questPool()` วน while-loop
เพื่อ resolve crafting chain (เช่น ซุปกระดูก → ราเมน) **อย่าลดรูปเป็น loop เดียว**

---

## Convention ของโค้ด

- **ภาษาไทยใน UI ทั้งหมด** — ชื่อด่าน ไอเทม ปุ่ม toast
- **คอมเมนต์ภาษาอังกฤษ** อธิบาย "ทำไม" ไม่ใช่ "ทำอะไร"
- CSS variables ธีมมืด: `--bg` `--card` `--border` `--text` `--dim`
  `--gold` `--green` `--red` `--purple`
- ไม่ใช้ `localStorage` ใน prototype (ยังไม่มีระบบ save)
- ไม่โหลด CDN / font นอก — ใช้ system font + emoji
- ตั้งชื่อ id ด่าน: `farm_*` `forest_*` `animal_*` `npc_*` `mine_*`

---

## สิ่งที่ห้ามทำ

| ห้าม | เพราะ |
|------|-------|
| แตกไฟล์เป็นหลายไฟล์ / ใส่ bundler | พี่แยมต้องดับเบิลคลิกเปิดได้เลย |
| แทรกด่านกลาง `DEF` array | จะเปลี่ยน prereq chain ของด่านถัดไปทั้งหมด |
| ลบ `nearEnough()` guard | ผู้เล่นจะปลดล็อคด่านไกลๆ ผ่านเข็มทิศได้ |
| ทำให้ `questPool()` ออกเควสของที่ทำไม่ได้ | ผู้เล่นตัน ทำเควสไม่จบ |
| แก้ข้อมูลด่านที่เดียวแล้วไม่ sync อีกไฟล์ | ข้อมูล 2 ไฟล์จะไม่ตรงกัน |
| ส่งงานโดยไม่ตรวจ syntax | ไฟล์พังแล้วพี่แยมเปิดไม่ได้ |
| ขยับเวอร์ชั่นแล้วไม่เขียน changelog | พี่แยมขอไว้ชัดเจนว่าต้องมีทุกครั้ง |

---

*โปรเจกต์ส่งต่อจากน้องโค่ (Cowork) · ดีไซน์ทั้งหมดอยู่ใน `GAME_DESIGN.md`*
