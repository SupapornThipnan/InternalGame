# เครื่องมือพัฒนาและสกิล

อัปเดต: 26 ตุลาคม 2026 · เวลาอ้างอิง Asia/Bangkok

## เครื่องมือและตำแหน่งที่พบ

| เครื่องมือ | ตำแหน่ง/สถานะที่ตรวจได้ |
|---|---|
| Unity Hub | มี `/Applications/Unity Hub.app` |
| Sourcetree | มี `/Applications/Sourcetree.app` |
| Unity CLI | `/Users/yamujung/.unity/bin/unity` |
| Unity project | `/Users/yamujung/Desktop/Unity/IsometricGame2D` |
| GameSkill source | `/Users/yamujung/Desktop/Unity/GameSkill` |
| REA source checkout | `/Users/yamujung/Desktop/Unity/REA` |
| REA ที่ Codex ใช้จริง | `/Users/yamujung/.codex/tools/rea-il2cpp-03ed0c6` |

เคยคุยเรื่อง clone GitHub URL ที่ Sourcetree แจ้ง `This is not a valid source path / URL` และการเชื่อมบัญชี GitHub การมีแอปติดตั้งไม่ได้ยืนยันว่าบัญชียัง login หรือ remote มีสิทธิ์แล้ว งานเอกสารรอบนี้ไม่เปลี่ยนบัญชี credential หรือ Git remote

เมื่อติดปัญหา clone ให้ตรวจ URL เต็มว่าเปิด repository ได้จริง ตรวจสิทธิ์ของบัญชี และ destination path ก่อน ไม่สรุปจากข้อความดังกล่าวเพียงอย่างเดียวว่าติดตั้ง Sourcetree ไม่สำเร็จ

## GameSkill และสกิลระดับผู้ใช้

ผู้ใช้ให้ติดตั้ง repository `https://github.com/gamedev-skills/awesome-gamedev-agent-skills.git` ไว้ใน `/Users/yamujung/Desktop/Unity/GameSkill`

สกิลที่พบใต้ `/Users/yamujung/.codex/skills/`:

- `router`
- `unity-csharp-scripting`, `unity-input-system`, `unity-animation`
- `unity-tilemap-2d`, `unity-physics`, `unity-navmesh`
- `unity-scriptableobjects`, `unity-build-pipeline`

REA ใช้ `/Users/yamujung/.agents/skills/reverse-engineer-anything/SKILL.md` แยกต่างหาก ส่วน Unity CLI skill มาจาก Unity plugin ใน Codex ไม่ได้อยู่ใน Unity project

`router` เลือกสกิลตาม engine และงาน ก่อนทำงานจริงให้อ่านสกิลที่เกี่ยวข้อง งานภาพนี้ใช้ `create-game-assets` จาก GameSkill กับ `imagegen` และงานใน Editor ใช้ `unity-cli` สกิลเป็นคู่มือการทำงาน ไม่ใช่ plugin ที่ Unity จะโหลดเป็น component เอง

## เชื่อม Unity Editor

CLI คุยกับ Editor ผ่าน `com.unity.pipeline` และในรอบทำฉากนี้ใช้ port **7800** พอร์ต/สถานะอาจเปลี่ยนเมื่อเปิด Editor ใหม่ ให้ตรวจ project เป้าหมายก่อนสั่งงาน

รันจากโฟลเดอร์ Unity project:

```bash
/Users/yamujung/.unity/bin/unity status --format json
/Users/yamujung/.unity/bin/unity command --format json
```

การส่งคำสั่งใช้รูปแบบ:

```bash
/Users/yamujung/.unity/bin/unity command eval \
  --port 7800 --caller plugin --skill unity-cli --format json \
  -- --code 'return UnityEngine.SceneManagement.SceneManager.GetActiveScene().path;' \
  --timeout 15000
```

`--timeout` หลัง `--` เป็น parameter ของ eval หน่วยมิลลิวินาที สำหรับ `eval` ต้องตรวจ `data.result.success` และ diagnostics ด้วย ไม่ใช่ดู outer `success` อย่างเดียว เพราะคำสั่งเรียกสำเร็จได้แม้ C# ที่ส่งไป compile ไม่ผ่าน

ตัวช่วยที่ใช้ในแชตนี้: `/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/work/unity_eval.py` อ่าน C# จากไฟล์ ส่งเป็น subprocess argument และเขียนผลเป็น `.result.json` จึงไม่ต้องยัด C# ยาว ๆ ลง shell โดยเสี่ยงเรื่อง quote

## ขั้นตอนตรวจ Play Mode ที่ใช้

1. จดค่า `Application.runInBackground` เดิม แล้วเปิดไว้ชั่วคราวถ้าจำเป็น
2. `set_autotick` ให้ Editor ที่ไม่ได้ focus ยังอัปเดต
3. `editor_play` แล้วรอ Editor พร้อมหลัง domain reload
4. `wait_for` ให้ `UnityEngine.Time.frameCount` เปลี่ยน
5. ตรวจภาพ ทางเดิน สิ่งกีดขวาง และ `console_status`/`console`
6. `editor_stop` คืนค่าที่เปลี่ยนชั่วคราว บันทึก Scene/Asset

ตัวอย่างพิสูจน์ว่าเฟรมเดินจริง:

```bash
/Users/yamujung/.unity/bin/unity command wait_for \
  --port 7800 --caller plugin --skill unity-cli --format json \
  -- --condition '{"member":"UnityEngine.Time.frameCount","op":"changed"}' \
  --timeout_s 10
```

ภาพในรายงานชุดนี้ถ่ายด้วย `Camera.Render()` ลงไฟล์ผ่าน eval และคืนตำแหน่งกล้อง/ตัวละครภายหลัง ภาพที่ถ่ายได้เพียงอย่างเดียวไม่พิสูจน์ว่าเกมกำลังเดินเฟรมหรือ UI overlay ทำงาน

## ข้อขัดข้องที่พบจริง

- `Operation not permitted` ขณะเชื่อม `127.0.0.1` เคยเกิดจาก sandbox ของแชต ไม่ใช่หลักฐานว่า Editor ปิด ต้องใช้สิทธิ์ network ของ host เมื่อต้องเชื่อมผ่าน shell
- ต้องมีสิทธิ์เขียนโฟลเดอร์ project/เอกสารที่อยู่นอก workspace ตาม sandbox ของรอบนั้น
- `unity status` ในชุดเครื่องมือนี้เคยเรียกชื่อ `editor status` ที่ provider ไม่รองรับ ทำให้ Console มี error จากเครื่องมือ ทั้งที่คำสั่ง eval และ Play Mode ยังใช้งานได้ อ่านข้อความจริงก่อนสรุปว่าโค้ดเกมพัง
- CLI แจ้ง tip ว่ามี Unity plugin ใน Codex; โปรเจกต์นี้ใช้ plugin skill อยู่แล้ว ไม่จำเป็นต้องทำ setup ซ้ำทุกครั้ง

อ่านการตั้งค่า REA MCP และ Java/Ghidra ที่ [REA_SETUP.md](/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/REA_SETUP.md)
