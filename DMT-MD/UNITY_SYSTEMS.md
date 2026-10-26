# Unity ระบบและแผนที่โค้ด

อัปเดต: 26 ตุลาคม 2026 · เวลาอ้างอิง Asia/Bangkok

## โปรเจกต์และขอบเขตปัจจุบัน

โปรเจกต์อยู่ที่ `/Users/yamujung/Desktop/Unity/IsometricGame2D` ใช้ Unity **6000.3.27f1** ตาม `ProjectSettings/ProjectVersion.txt` ไม่ใช้เลขเวอร์ชันเก่าใน README เป็นตัวตัดสิน Editor

ฉากหลักที่ตกแต่งคือ `Assets/Scenes/Demetria_Demo.unity` งานก่อนหน้าได้นำ Tilemap จาก `Demetria_East` มาทำต่อในฉากนี้แล้ว มี mockup โซนตะวันออก 11 ด่าน ดูรายการใน [ทะเบียนด่าน](/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/UNITY_STAGE_REGISTER.md)

Packages ที่พบใน `Packages/manifest.json`: Input System `1.20.1`, URP `17.3.0`, Tilemap Extras `6.0.3`, Pipeline `0.7.0-exp.1` และ Test Framework `1.6.0`

## Grid และพิกัด

`EastRegion` ใช้ Isometric Grid ขนาด cell `(1, 0.5, 1)` ด่านตกแต่งแต่ละช่องมี Ground 10×10 cell

สำหรับ Grid ที่ไม่หมุน/สเกลเพิ่ม การแปลง cell `(x,y)` ที่ใช้อยู่คือ:

```text
worldX = 0.5 × (x − y)
worldY = 0.25 × (x + y)
```

ในโค้ดจริงให้ใช้ `Grid.CellToWorld`, `WorldToCell` และ `CellToLocalInterpolated` แทนการ hardcode สูตรเมื่อตำแหน่ง/Transform ของ Grid เปลี่ยน เส้นฐานของวัตถุบนจอต้องขนานกับแกนความชัน `+0.5` หรือ `−0.5` และเสาตั้งต้องตั้งตรง

`IsometricFurnitureGridOverlay.cs` สร้างเส้นแสดงช่องและเส้นครึ่งช่องจาก Grid จริง ไม่ใช่ภาพกริดแปะทับ ปรับแสดง/ซ่อนผ่านค่าของ component

## ตัวละครและการเดิน

ไฟล์ [DemetriaPlayerController.cs](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Scripts/Player/DemetriaPlayerController.cs) มีหน้าที่:

- อ่าน `Player/Move` จาก Input Actions และ clone action ของตัวเอง
- เดินบน Ground ที่กำหนด โดยเช็กเท้าและระยะ `footRadius` รอบเท้า
- แบ่งการเคลื่อนที่เป็นก้าวสั้นเพื่อลดการข้ามพื้นที่ต้องห้ามเมื่อเฟรมช้า
- กลับด้าน sprite ซ้าย/ขวาและอัปเดต sorting ตามตำแหน่งเท้า
- bool `moveAlongGrid` แสดงใน Inspector เป็น **Move Along Grid** และมี property `MoveAlongGrid`

เมื่อเปิด bool นี้ input จะเดินตามสองแกนของ Ground Grid การเดินยังต่อเนื่อง ไม่ใช่ขยับทีละ cell และไม่ snap ตัวละครทุกก้าว เมื่อปิดจะใช้ทิศ input ตามหน้าจอ

ค่าที่พบจากผลตรวจงานล่าสุด: ความสูง renderer ตัวละครประมาณ **1.5247 world units** และ `MoveAlongGrid = true` ค่า Inspector ในภาพช่วงก่อนมี Move Speed `2.6` และ Foot Radius `0.1`; ถ้ามีการปรับภายหลังให้อ่าน component ปัจจุบันก่อนแก้

ตัวละครใน mockup ใช้ static sprite; ไม่ควรสรุปว่ามี animation เดิน 4 ทิศจากการเคลื่อนที่เพียงอย่างเดียว

## สิ่งกีดขวางและการเรียงภาพ

[GridFootprintObstacle.cs](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Scripts/Grid/GridFootprintObstacle.cs) เก็บ Grid และขนาด footprint คำนวณ cell ที่จองจากตำแหน่ง object มี registry ระหว่างเปิดใช้งาน และ `IsBlocked(grid,cell)` ให้ player ใช้ปฏิเสธการเดินเข้า

นี่เป็นการกันพื้นที่บน Grid ไม่ใช่ระบบ NavMesh หรือ Collider2D เต็มรูปแบบ ต้องให้ `SourceGrid` ตรงกับ `Ground.layoutGrid` และทดสอบใน Play Mode เพราะ registry ไม่ใช่หลักฐานที่เชื่อถือได้เมื่ออ่านเฉพาะ Edit Mode

Sprite ส่วนใหญ่เรียงด้วยค่าประมาณ `1000 − round(worldY × 100)` โดยใช้ pivot ใกล้พื้น Native Mesh ของขอบแปลงแยกหน้าหลังเพื่อให้พืชถูกบังด้านหน้าได้ถูกต้อง ขนาด footprint กับขนาดภาพเป็นคนละค่า

[GridAlignedMockup.cs](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Scripts/Grid/GridAlignedMockup.cs) เป็นตัวช่วยที่มีอยู่ในโปรเจกต์ ใช้จุด landmark พื้น 3 จุดในภาพเพื่อ map quad ไปยัง Grid ต้องกำหนด Texture, จุดอ้างอิงและ footprint ก่อน ไม่ใช่ตัวหาขอบ/ปรับ perspective หรือสเกลเทียบตัวละครให้อัตโนมัติ

## กล้อง

- [SmoothPlayerCameraFollow.cs](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Scripts/Camera/SmoothPlayerCameraFollow.cs): ติดตามผู้เล่นใน LateUpdate มี framing offset, deadzone และ SmoothDamp
- [SmoothCameraZoom.cs](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Scripts/Grid/SmoothCameraZoom.cs): ซูมและควบคุมการแพนตามโหมด
- `Assets/Editor/DemetriaPlayerCameraSetup.cs` และ `SmoothCameraZoomSetup.cs`: ตัวช่วยตั้งค่า/ตรวจกล้อง

## ระบบอื่นที่พบใน source

ส่วนต่อไปนี้มีอยู่ในโปรเจกต์ แต่ไม่ได้ทดสอบทุกฟังก์ชันซ้ำในงานทำสวนผลไม้:

| กลุ่ม | ไฟล์หลัก/ตำแหน่ง | หน้าที่จาก source |
|---|---|---|
| วางเฟอร์นิเจอร์ | `Assets/Scripts/Placement/PlacementController.cs` | วาง เลือก ย้าย หมุน จัดตำแหน่งและกลุ่ม sorting |
| ข้อมูลเฟอร์นิเจอร์ | `PlaceableDefinition.cs` | Prefab, Footprint, VisualScale, VisualOffset, ชนิดระดับ Floor/Surface/Wall/Ceiling |
| ตรวจการวาง | `PlacementRules.cs`, `GridOccupancy.cs` | เงื่อนไขชน พื้นที่ และตัวรองรับ |
| ประวัติแก้ไข | `PlacementHistory.cs` | ประวัติการจัดวาง |
| อาคาร/พื้น/ผนัง/รั้ว | `PlacementBuildingTool.cs`, `BuildingMesh.cs`, `PlacementFenceTool.cs` | เครื่องมือสร้างอาคารและรั้ว |
| เซฟ layout เฟอร์ | `PlacementBuildingSave.cs` | export/import และ `build-layout-v1.json` ใต้ `Application.persistentDataPath` |
| เฟอร์แยกชั้นสี | `Assets/Scripts/Rendering/LayeredFurnitureVisual.cs` | ภาพเฟอร์และสีแยกส่วน |
| อุปกรณ์ตัวละคร | `Assets/Scripts/Equipment/` | catalog, equipment binding, authored skin และหน้าต่าง preview |

ระบบเซฟ layout เฟอร์ไม่เท่ากับระบบเซฟความคืบหน้า ECO ทั้งเกม เอกสารเดิมของระบบวางเฟอร์อยู่ที่ `/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/PlacementDemo/*.md` และเอกสารชุดอุปกรณ์อยู่ที่ `Assets/CharacterPilot/Equipment/`

## เครื่องมือ Editor และสคริปต์งานรอบนี้

`Assets/Editor/` มี `DemetriaEastMapSetup`, `DemetriaDemoMapSetup`, `DemetriaPlayerSetup`, `DemetriaFurnitureGridSetup`, `DemetriaMockupSetup` และ `DemetriaStarterGardenSetup` อ่านโค้ดก่อนเรียกเมนู setup เพราะบางตัวมีหน้าที่สร้างหรือจัดฉากใหม่

สคริปต์นำเข้า Asset รายด่านในแชตนี้อยู่ที่ `/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/work/import-*.cs` และรันผ่าน Unity CLI `eval` จึง **ไม่ได้กลายเป็น component ที่ติดทุก Asset อัตโนมัติ** สคริปต์ช่วยเรียกอยู่ที่ `/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/work/unity_eval.py`

## สิ่งที่ยังไม่ควรนับว่าเสร็จ

- การเชื่อม mockup แต่ละด่านกับ Stage State/ข้อมูล ECO
- การผลิต NPC แบบ idle และคลังประจำด่าน
- เก็บผลผลิต กระเป๋า คราฟ เควส และบูรณะครบ loop ใน Unity
- เซฟ/โหลดความคืบหน้าเกมทั้งชุด และ animation ของสัตว์ใน mockup
- ระบบปรับ Asset ใหม่อัตโนมัติด้วยการอ้างอิงตัวละครทุกชิ้น (เลื่อนไว้)

รายการเหล่านี้เป็นขอบเขตที่ยังไม่ยืนยันว่ามี integration ครบใน `Demetria_Demo`; บางระบบมี HTML prototype หรือ source ทดลองแยกอยู่แล้ว
