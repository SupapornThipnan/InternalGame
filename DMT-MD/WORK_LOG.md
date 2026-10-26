# บันทึกงานและจุดทำต่อ

อัปเดต: 26 ตุลาคม 2026 · เวลาอ้างอิง Asia/Bangkok

## 26 ตุลาคม 2026 จัดเอกสารงานย้อนหลัง

ผู้ใช้กำหนดที่เก็บเอกสาร: ระบบ/โค้ด/REA ที่ `/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD` และเกมดีไซน์ที่ `/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/NongCoco-DMT` จัดสารบัญ แผนที่โค้ด ทะเบียน 11 ด่าน Asset pipeline เครื่องมือ REA และข้อสรุปดีไซน์ โดยไม่เขียนทับ `GAME_DESIGN.md` หรือ `AGENTS.md` เดิมในโฟลเดอร์เกมดีไซน์

ข้อมูลมาจากไฟล์โปรเจกต์ ฉากที่บันทึก ผลตรวจรอบทำงานก่อนหน้า และ config/REA MCP ที่อ่านได้ในรอบนี้ งานเขียนเอกสารไม่ได้แก้ฉาก โค้ดเกม HTML prototype หรือการลงทะเบียน MCP

## 26 ตุลาคม 2026 สวนผลไม้

- ด่าน `farm_d` เป็นด่านถัดจากโรงผึ้งในคิวทำภาพตะวันออก ผลผลิตสตรอเบอร์รี่ แอปเปิ้ล เชอร์รี่
- ทำภาพร้านหลังคาแดง พร้อมตัวเลือกซุ้มตลาดและเรือนกระจก ผู้ใช้กลับมาเลือกภาพร้านหลังคาแดงและเปลี่ยนเชอร์รี่เป็นพุ่ม
- แยกภาพ 8 ชิ้น นำเข้า `Demetria_Demo` ที่ root `OrchardFarm_Mockup_v1` ตำแหน่ง `(12,6,0)`
- เพิ่มแปลงสตรอเบอร์รี่และดอกไม้ รั้ว ทางทราย footprint กีดขวาง 9 จุด และ Prefab แยก/รวม
- ปรับพืชให้ลงในแปลง ตรวจภาพเทียบตัวละคร รูปใหม่ 256/Mitchell/None และไม่เปิด mipmaps
- ผลตรวจ Play Mode: frameCount เปลี่ยน ทางเข้าผ่าน จุดทดสอบเส้นกลาง 21 จุดผ่าน และศูนย์กลางสิ่งกีดขวางทั้ง 9 จุดถูกกัน
- สคริปต์ตรวจ metadata/GUID: 1,440 ไฟล์ error 0 warning 0; `compilationFailed = false` ไม่ได้อ้างว่าไม่มี Console error จาก CLI
- บันทึก Scene/Prefab แล้ว กลับ Edit Mode และคืน `Application.runInBackground` เป็น false

ไฟล์ส่งต่อ: [Prefab รวม](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Prefabs/Demetria/OrchardFarm/OrchardFarm_10x10.prefab) · [Prompt และแหล่งภาพ](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Art/Demetria/OrchardFarm/v1/GenerationManifest.json) · [ภาพใน Unity](/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/outputs/Demetria_OrchardFarm_Unity.png)

## 26 ตุลาคม 2026 เรื่องสเกลที่พักไว้

ผู้ใช้ถามว่ามี Script ย่อขยาย Asset ให้สัมพันธ์กับตัวละครหรือไม่ อธิบายว่ามีสคริปต์นำเข้าที่กำหนดขนาดรายชิ้นและคำนวณ PPU/Scale แต่ยังไม่มี component ที่หาและปรับ Asset ทุกชิ้นจากตัวละครเอง ผู้ใช้ตอบว่า **เดี๋ยวค่อยกลับมาทำ** จึงยังไม่เพิ่มระบบนี้

## 26 ตุลาคม 2026 ปิดงานโรงผึ้งที่ค้างการตรวจ

ตรวจผลนำเข้ารอบก่อนที่ถูกขัดจังหวะ พบว่า import สำเร็จแล้ว จึงตรวจภาพและ Play Mode ต่อจนจบ มีร้าน รังผึ้ง 3 รังเท่ากัน แปลงดอกไม้ 2 แปลงและผึ้งตกแต่ง 6 ตัว root อยู่ `(-12,6,0)` ทดสอบทางเข้าและ footprint ครบ 9 จุด บันทึกฉากและ Prefab รวมแล้ว

## ช่วง 25–26 ตุลาคม 2026 งานก่อนหน้าในแชตนี้

สรุปรวมตามหัวข้อเพื่อใช้ส่งต่อ ไม่ใช่ timestamp รายการติดตั้งทุกครั้ง:

- ตั้งต้น Unity Hub/Editor และคุยแก้การ clone/เชื่อม GitHub ผ่าน Sourcetree; ปัจจุบันพบแอปทั้งสองบนเครื่อง แต่ไม่ได้ตรวจสถานะบัญชี GitHub ซ้ำในงานเอกสารนี้
- Clone GameSkill และติดตั้ง router/สกิล Unity ระดับผู้ใช้ให้ Codex ใช้ตามงาน
- Clone REA ตั้ง MCP/skill ระดับผู้ใช้ ติดตั้ง Ghidra และ Java และเปลี่ยน runtime ให้มีเครื่องมือ IL2CPP metadata
- ตรวจโปรเจกต์ `IsometricGame2D` และใช้ GameDesign กำกับ mockup ของแมพตะวันออก
- ติดตั้ง/เชื่อม Unity CLI ผ่าน Pipeline และนำ Tilemap จาก `Demetria_East` ไปทำต่อใน `Demetria_Demo`
- ทำฟาร์มแรกละเอียดเป็นตัวอย่าง แล้วทำด่านต่อ ๆ ไปตามโซนตะวันออก
- เพิ่ม bool **Move Along Grid** ให้ตัวละครเลือกเดินตามแกน Grid ได้
- แก้ Grid ของขอบแปลง รั้ว สะพาน และทางเดินในฉากที่ผู้ใช้ชี้
- ตั้งค่าภาพใหม่ Max Size 256 / Mitchell / Automatic / Compression None โดยคงขนาดในเกม
- เปลี่ยนพื้นไร่ข้าวโพดเป็นทราย และใช้พื้นทรายกับด่านกระต่าย ผึ้ง ผลไม้

ดูชื่อด่านครบ พิกัดและหลักฐานภาพใน [ทะเบียนด่าน](/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/UNITY_STAGE_REGISTER.md) และดูข้อตกลงภาพใน [UNITY_ART_DECISIONS.md](/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/NongCoco-DMT/UNITY_ART_DECISIONS.md)

## สิ่งที่คุยแล้ว แต่ยังไม่ใช่งาน gameplay ที่ปิดครบ

- mockup/Prefab แต่ละด่านยังไม่ใช่การทำระบบผลิต เก็บของ เควส บูรณะ และเซฟ ECO ใน Unity ครบวงจร
- ตัวละครและสัตว์ในฉากตกแต่งยังไม่เท่ากับมีชุด animation และ AI ทำงานครบ
- REA เชื่อม MCP และ Ghidra provider พร้อมตามผลอ่านสถานะ; การทดสอบ IL2CPP ในหลักฐานเดิมใช้ fixture ไม่ใช่เกมจริงทุก build
- การมี SourceTree/Hub/skills บนเครื่องไม่ยืนยัน account session หรือว่า Editor ทุกโปรเจกต์เชื่อมเหมือนกันโดยไม่ตรวจ

## จุดกลับมาทำต่อ

1. ถ้าสั่งทำด่านตะวันออกต่อ: สร้างภาพ **สวนดอกไม้ `farm_flower`** ให้ดูและรอเลือกแบบก่อนนำเข้า
2. ถ้ากลับมางาน gameplay: อ่าน GDD แล้วเลือก scope การเชื่อม stage state/บูรณะ/ผลิต/คลังให้ชัด ไม่เริ่มจากสมมติว่า mockup มีระบบเหล่านี้แล้ว
3. ระบบปรับสเกล Asset อัตโนมัติ: รอผู้ใช้กลับมาสั่งต่อ
4. ทุกงานใหม่ให้เพิ่มผลที่ทำและผลตรวจในเอกสารหัวข้อที่เกี่ยวข้อง รวมทั้งบันทึกนี้
