# ทะเบียน mockup ด่านใน Unity

อัปเดต: 26 ตุลาคม 2026 · เวลาอ้างอิง Asia/Bangkok

ฉาก `/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Scenes/Demetria_Demo.unity` มี root ของ mockup 11 ด่านต่อไปนี้ตามไฟล์ฉากที่บันทึกและผลนำเข้า ตำแหน่งเป็น world position ของ root ใน Grid ปัจจุบัน ไม่ใช่พิกัด cell และไม่ใช่ลำดับปลดล็อคทั้งเกม

| ลำดับทำภาพโซนตะวันออก | Stage ID | Object root | World position | Prefab รวม | ภาพตรวจใน Unity |
|---|---|---|---|---|---|
| 1 | `farm_a` | `FarmShop_Mockup_v1` | `(0, 0, 0)` | [FarmShop](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Prefabs/Demetria/FarmShop/FarmShop_10x10.prefab) | [ภาพ](/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/outputs/Demetria_FarmShop_Unity.png) |
| 2 | `forest_a` | `FirstForest_Mockup_v1` | `(-6, 3, 0)` | [FirstForest](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Prefabs/Demetria/FirstForest/FirstForest_10x10.prefab) | [ภาพ](/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/outputs/Demetria_ForestPathOnly_Unity.png) |
| 3 | `animal_a` | `AnimalFarm_Mockup_v1` | `(6, 3, 0)` | [AnimalFarm](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Prefabs/Demetria/AnimalFarm/AnimalFarm_10x10.prefab) | [ภาพ](/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/outputs/Demetria_AnimalFarm_Unity.png) |
| 4 | `farm_b` | `VegFarm_Mockup_v1` | `(-6, -3, 0)` | [VegFarm](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Prefabs/Demetria/VegFarm/VegFarm_10x10.prefab) | [ภาพ](/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/outputs/Demetria_VegFarm_Unity.png) |
| 5 | `forest_b` | `DeepForest_Mockup_v1` | `(6, -3, 0)` | [DeepForest](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Prefabs/Demetria/DeepForest/DeepForest_10x10.prefab) | [ภาพ](/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/outputs/Demetria_DeepForest_PathGridFixed.png) |
| 6 | `animal_b` | `PastoralFarm_Mockup_v1` | `(0, 6, 0)` | [PastoralFarm](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Prefabs/Demetria/PastoralFarm/PastoralFarm_10x10.prefab) | [ภาพ](/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/outputs/Demetria_PastoralFarm_Unity.png) |
| 7 | `animal_fish` | `Fishery_Mockup_v1` | `(-12, 0, 0)` | [Fishery](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Prefabs/Demetria/Fishery/Fishery_10x10.prefab) | [ภาพ](/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/outputs/Demetria_Fishery_PathGridFixed.png) |
| 8 | `farm_c` | `CornFarm_Mockup_v1` | `(12, 0, 0)` | [CornFarm](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Prefabs/Demetria/CornFarm/CornFarm_10x10.prefab) | [ภาพ](/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/outputs/Demetria_CornFarm_Sand.png) |
| 9 | `animal_rabbit` | `RabbitFarm_Mockup_v1` | `(0, -6, 0)` | [RabbitFarm](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Prefabs/Demetria/RabbitFarm/RabbitFarm_10x10.prefab) | [ภาพ](/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/outputs/Demetria_RabbitFarm_Unity.png) |
| 10 | `animal_bee` | `BeeFarm_Mockup_v1` | `(-12, 6, 0)` | [BeeFarm](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Prefabs/Demetria/BeeFarm/BeeFarm_10x10.prefab) | [ภาพ](/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/outputs/Demetria_BeeFarm_Unity.png) |
| 11 | `farm_d` | `OrchardFarm_Mockup_v1` | `(12, 6, 0)` | [OrchardFarm](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Prefabs/Demetria/OrchardFarm/OrchardFarm_10x10.prefab) | [ภาพ](/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/outputs/Demetria_OrchardFarm_Unity.png) |

ข้อมูลผลผลิตและคิวด่านต่อไปแยกไว้ใน [EAST_STAGE_PLAN.md](/Users/yamujung/Desktop/Unity/InternalGame/DMT-MD/NongCoco-DMT/EAST_STAGE_PLAN.md) การเรียงเฉพาะด่านตะวันออกไม่ได้ลบ prerequisite ร้านคราฟ/ด่านทิศอื่นที่คั่นอยู่ใน progression จริง

## สวนผลไม้ งานล่าสุด

- Root: `OrchardFarm_Mockup_v1` อยู่ใต้ `farm_d__สวนผลไม้` ที่ `(12,6,0)`
- Ground cell bounds: ตำแหน่ง `(19,-5,0)` ขนาด `(10,10,1)`; center cell `(24,0,0)`
- ภาพ 8 ชิ้น: `OrchardShop`, `AppleTree`, `CherryBush`, `StrawberryPlants`, `FruitWorkbench`, `FruitCart`, `FruitSeating`, `FruitCrates`
- ภาพอยู่ที่ `/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Art/Demetria/OrchardFarm/v1`
- Prefab เพิ่มเติม: `StrawberryBed`, `FlowerBed`, `OrchardSandPath` และ Prefab รวม
- แปลงใช้ geometry ขอบไม้จากชุด CornFarm; ดอกไม้ใช้ `BeeFarm/FlowerCluster`; รั้วใช้ `FisheryFence`; พื้นทรายใช้ชุด `CornPath`
- `CherryBush` เป็นพุ่มเตี้ยตามภาพที่ผู้ใช้แก้ล่าสุด ไม่ใช้ต้นเชอร์รี่ทรงสูง
- ปรับต้นสตรอเบอร์รี่ลงในแปลง และบันทึก Prefab รวมหลังปรับแล้ว
- มี footprint กีดขวาง 9 จุด: ร้าน แอปเปิ้ล เชอร์รี่ แปลงสตรอเบอร์รี่ แปลงดอกไม้ โต๊ะ ที่นั่ง รถเข็น และลัง

ผลตรวจรอบนำเข้าสวนผลไม้: Play Mode มีเฟรมเดินต่อ, `CanStandAt` ผ่านทางเข้ากับเส้นกลางถึงหน้าร้าน 21 จุด และปฏิเสธจุดกลางสิ่งกีดขวางทั้ง 9 จุด รูปใหม่ทั้ง 8 ชิ้น Max Size 256 / Mitchell / Uncompressed / mipmaps off ตรวจ metadata/GUID โครงการ 1,440 ไฟล์ไม่พบ error หรือ warning จากสคริปต์ตรวจ

ผลนี้ไม่ใช่การทดสอบกดปุ่มคราฟ เก็บเกี่ยว หรือเล่น progression ทั้งเกม Console มีข้อความเครื่องมือ CLI เกี่ยวกับ `editor status` ที่ไม่ตรงชื่อคำสั่ง; `compilationFailed` เป็น false จึงไม่อ้างว่า Console ว่างทั้งหมด

หลักฐานรอบล่าสุด: `/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/work/verify-orchard.cs.result.json`, `verify-orchard-path.cs.result.json`, `finalize-orchard.cs.result.json` และ [GenerationManifest](/Users/yamujung/Desktop/Unity/IsometricGame2D/Assets/Art/Demetria/OrchardFarm/v1/GenerationManifest.json)

## งานแก้ Grid ที่ทำไว้แล้ว

- แปลงพืช: ใช้ขอบ/ดินเป็น Mesh ตาม Grid จริงแทนการพยายามหมุนภาพทั้งแปลงให้ตรง
- Fishery: ปรับรั้วและสะพานเป็นชิ้น geometry ที่ขนาน Grid และแก้ทางเดิน
- DeepForest: ปรับทางเดินหินให้ขอบตรงกับ cell และแกน Isometric
- FirstForest: แยกงานพื้นและทางเดินตามคำขอ ต่อมาเอาหญ้าที่ติดมากับภาพพื้นออกเพื่อให้เหลือทางเดิน
- CornFarm: เปลี่ยนพื้นทางเดินจากแผ่นปูสีอ่อนเป็นทรายสีพีชตามคำขอ

## วิธีเพิ่มด่านใหม่

ตรวจ Ground และ root ปัจจุบันก่อน นำเข้าเฉพาะช่องด่านที่อนุมัติแล้ว เก็บ Asset ในโฟลเดอร์ชื่อด่าน สร้าง Prefab แยกและรวม ตรวจทางเข้า/footprint/สเกล/ภาพจริง แล้วอัปเดตทะเบียนนี้กับ `WORK_LOG.md`

อย่ารัน `import-*.cs` ซ้ำแบบไม่ตรวจ เพราะสคริปต์นำเข้าหลายชุดมี guard กัน root ซ้ำและอาจสร้าง Scene backup หรือเขียน Prefab
