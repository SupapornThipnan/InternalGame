# Demetria Spirit เอกสารงานพัฒนา

อัปเดต: 26 ตุลาคม 2026 · เวลาอ้างอิง Asia/Bangkok

ศูนย์รวมบันทึกที่สรุปจากการคุยและทำงานใน Codex สำหรับโปรเจกต์ Unity `IsometricGame2D` เครื่องมือพัฒนา และ REA เริ่มอ่านไฟล์นี้เมื่อต้องกลับมาทำงานต่อ

## เก็บเอกสารเรื่องไหนที่ไหน

- **ระบบ โค้ด Unity เครื่องมือ Codex MCP REA และบันทึกงาน:** `/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD`
- **เกมดีไซน์ เนื้อหา ผลผลิต ความคืบหน้าด้านภาพ และข้อตกลงออกแบบ:** `/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/NongCoco-DMT`
- กฎการเขียนเอกสารต่อไป: [AGENTS.md](/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/AGENTS.md)

## เอกสารงานพัฒนา

| เอกสาร | เนื้อหา |
|---|---|
| [UNITY_SYSTEMS.md](/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/UNITY_SYSTEMS.md) | ฉาก Grid ตัวละคร กล้อง สิ่งกีดขวาง และแผนที่ไฟล์โค้ด |
| [UNITY_STAGE_REGISTER.md](/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/UNITY_STAGE_REGISTER.md) | mockup 11 ด่าน ชื่อ object พิกัด Prefab และรูปจาก Unity |
| [ASSET_PIPELINE.md](/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/ASSET_PIPELINE.md) | ขั้นตอนภาพตัวอย่าง → Asset → Unity, Grid, สเกล และ Max Size 256 |
| [TOOLCHAIN.md](/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/TOOLCHAIN.md) | Unity Hub, Sourcetree, Unity CLI, GameSkill และสกิลระดับผู้ใช้ |
| [REA_SETUP.md](/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/REA_SETUP.md) | REA MCP, Ghidra, Java, IL2CPP และไฟล์ที่ต้องเตรียม |
| [WORK_LOG.md](/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/WORK_LOG.md) | ผลงานล่าสุด สิ่งที่เลื่อนไว้ ผลตรวจ และจุดกลับมาทำต่อ |

## เอกสารเกมดีไซน์

- [สารบัญเกมดีไซน์](/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/NongCoco-DMT/README.md)
- [GAME_DESIGN.md เดิม](/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/NongCoco-DMT/GAME_DESIGN.md) — รักษาเนื้อหาเดิมไว้
- [EAST_STAGE_PLAN.md](/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/NongCoco-DMT/EAST_STAGE_PLAN.md) — ลำดับด่านตะวันออกและผลผลิตตามข้อมูล prototype
- [UNITY_ART_DECISIONS.md](/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/NongCoco-DMT/UNITY_ART_DECISIONS.md) — ภาพและ layout ที่คุยและเลือกใช้ใน Unity

## สถานะที่กลับมาทำต่อได้

งานล่าสุดคือ **สวนผลไม้ `farm_d`**: ร้านหลังคากระเบื้องแดง ต้นแอปเปิ้ล พุ่มเชอร์รี่ และแปลงสตรอเบอร์รี่ แยกภาพ 8 ชิ้น นำเข้า `Demetria_Demo` และมี Prefab รวมแล้ว ด่านถัดไปในคิวทำภาพโซนตะวันออกคือ **สวนดอกไม้ `farm_flower`**

ฉากที่ตกแต่งเป็น mockup สำหรับตรวจภาพ ขนาด และทางเดิน การมีร้าน ต้นไม้ หรือสัตว์ในฉากไม่ได้หมายความว่าระบบผลิต เก็บของ เควส หรือบูรณะของด่านนั้นเสร็จแล้ว

ระบบย่อขยาย Asset โดยอ่านความสูงตัวละครอัตโนมัติทุกชิ้น **ผู้ใช้ขอเลื่อนไว้** ตอนนี้ใช้ค่าขนาดเป้าหมายในสคริปต์นำเข้าของแต่ละชุด

## ตำแหน่งหลัก

| สิ่งที่ใช้ | ตำแหน่ง |
|---|---|
| Unity project | `/Users/yamujung/Desktop/Unity/IsometricGame2D` |
| ฉากที่ทำ mockup | `/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Scenes/Demetria_Demo.unity` |
| ฉากต้นทาง Tilemap | `/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Scenes/Demetria_East.unity` |
| ภาพแยก | `/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Art/Demetria` |
| Prefab แยกตามด่าน | `/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Prefabs/Demetria` |
| HTML prototype | `/Users/yamujung/Desktop/Unity/InternalGame/DMT_GameDesign_Demo` |
| ซอร์ส GameSkill | `/Users/yamujung/Desktop/Unity/GameSkill` |
| ซอร์ส REA | `/Users/yamujung/Desktop/Unity/REA` |
| สคริปต์และผลตรวจของแชตนี้ | `/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/work` |
| ภาพจาก Unity ของแชตนี้ | `/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/outputs` |

## วิธีอ่านสถานะ

เอกสารแยก **ทำแล้วและมีไฟล์/ผลตรวจ**, **พบใน source แต่ไม่ได้ทดสอบซ้ำในงานนี้**, **ดีไซน์ที่รอ implement** และ **เรื่องที่เลื่อนไว้** ผลตรวจมีขอบเขตตามวันที่และไฟล์ที่ระบุ ไม่ใช่การรับรองว่าทุกระบบของเกมทำงานครบ
