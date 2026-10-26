# REA MCP Ghidra และ Unity IL2CPP

อัปเดต: 26 ตุลาคม 2026 · เวลาอ้างอิง Asia/Bangkok

## ติดตั้งอะไรไว้แล้ว

ผู้ใช้ให้ติดตั้ง `https://github.com/morluto/rea.git` ไว้ที่ `/Users/yamujung/Desktop/Unity/REA` ต่อมาเพิ่มความสามารถอ่าน IL2CPP metadata และตั้งค่า Codex ระดับผู้ใช้

**ซอร์สที่ clone ไว้กับ runtime ที่ Codex รันเป็นคนละตำแหน่ง** การ pull repository บน Desktop อย่างเดียวไม่เปลี่ยน MCP ที่กำลังใช้อยู่

| ส่วน | ตำแหน่ง/เวอร์ชัน |
|---|---|
| Source checkout | `/Users/yamujung/Desktop/Unity/REA` |
| Runtime ที่ลงทะเบียนจริง | `/Users/yamujung/.codex/tools/rea-il2cpp-03ed0c6` |
| Runtime package version | `rea-agents 6.7.0` |
| Node ที่ MCP ใช้ | `/Users/yamujung/.codex/tools/node-v24.22.1-darwin-arm64/bin/node` |
| CLI entry | `/Users/yamujung/.codex/tools/rea-il2cpp-03ed0c6/scripts/rea.mjs` |
| Ghidra | `/Users/yamujung/.codex/tools/ghidra/ghidra_12.1.4_PUBLIC` |
| Java | `/Users/yamujung/.codex/tools/java/jdk-21.0.13+9/Contents/Home` |
| Skill | `/Users/yamujung/.agents/skills/reverse-engineer-anything/SKILL.md` |
| Codex config | `/Users/yamujung/.codex/config.toml` ส่วน `[mcp_servers.rea]` |

บันทึกซอร์สรอบ IL2CPP อ้าง commit `03ed0c63d9566dbc0d6e805bc62ccd7569bad314` ตามไฟล์งานเดิม ชื่อ runtime มี prefix นี้ แต่ live server รายงาน `build_commit: null` จึงไม่ถือว่าชื่อโฟลเดอร์เป็นหลักฐานของ build digest ทั้งชุด

## ค่าลงทะเบียน MCP ที่อ่านได้ในรอบนี้

```toml
[mcp_servers.rea]
command = "/Users/yamujung/.codex/tools/node-v24.22.1-darwin-arm64/bin/node"
args = ["/Users/yamujung/.codex/tools/rea-il2cpp-03ed0c6/scripts/rea.mjs", "mcp"]
startup_timeout_sec = 30
tool_timeout_sec = 450

[mcp_servers.rea.env]
GHIDRA_INSTALL_DIR = "/Users/yamujung/.codex/tools/ghidra/ghidra_12.1.4_PUBLIC"
JAVA_HOME = "/Users/yamujung/.codex/tools/java/jdk-21.0.13+9/Contents/Home"
REA_DARWIN_MODULE_CACHE_PATH = "/Users/yamujung/.codex/tools/rea/module-cache"
```

นี่เป็น snapshot ของค่าที่มีอยู่ ไม่ได้เขียน config ใหม่ในงานเอกสารรอบนี้ และไม่มี token/credential อยู่ในตัวอย่างนี้

## สถานะที่ตรวจได้

การเรียก `binary_session` ผ่าน MCP ในงานเอกสารวันที่ 26 ตุลาคม 2026 สำเร็จ:

- Server `rea` version `6.7.0` รันจาก runtime ด้านบน
- Catalog มี MCP tools **227**, CLI commands **175**, prompts **6**; skill คาด version **49**
- Ghidra provider candidate เป็น `available` ตรวจ installation, headless, native decompiler และ Java ผ่าน
- Ghidra `12.1.4`, Java `21.0.13`, host `darwin/arm64`
- ไม่มี binary เปิดค้าง (`open: false`) และไม่มี cleanup pending

นี่พิสูจน์การเชื่อมต่อและความพร้อมของ provider ในตอนตรวจ ไม่ใช่การวิเคราะห์เกมจริงจบครบทุกระบบ

หลักฐาน IL2CPP เดิมที่ `/Users/yamujung/Documents/Codex/2026-10-25/unity-hub-x20/work/rea-il2cpp-mcp-test.json` บันทึกการเชื่อม MCP และอ่าน **fixture metadata v39** สำเร็จ ส่วน `il2cpp-cli-test.json` เป็นความพยายามหนึ่งที่จบด้วย path ไม่พบไฟล์ จึงไม่ใช้ไฟล์นั้นเป็นหลักฐานว่าการวิเคราะห์ CLI ผ่าน

`rea-ghidra-doctor.json` เก่าเคยมี `spawn EPERM` ใน sandbox ให้แยกจากผล MCP ปัจจุบันที่ตรวจ Java/Ghidra ผ่าน ไม่จำเป็นต้องลง Java ซ้ำจาก log เก่าเพียงอย่างเดียว

## เตรียมไฟล์เกม Unity

| Build | ควรเตรียม |
|---|---|
| Mono บน Windows/Linux/macOS | ตัวเกมพร้อมโฟลเดอร์ Data โดยเฉพาะ `Managed/Assembly-CSharp.dll` และ DLL ที่เกี่ยวข้อง |
| IL2CPP บน Windows | `GameAssembly.dll` คู่กับ `*_Data/il2cpp_data/Metadata/global-metadata.dat` และ Data ของ build เดียวกัน |
| IL2CPP บน Android | APK/ชุด split ที่ครบ, native `libil2cpp.so` ของ ABI ที่เลือก และ `assets/bin/Data/Managed/Metadata/global-metadata.dat` เมื่อ build วางไว้ตำแหน่งนี้ |
| IL2CPP บน macOS | `.app` ทั้งชุด, native executable/Unity IL2CPP binary ที่พบใน bundle และ metadata ที่พบจริงใน Data |
| iOS | `.app`/IPA ที่ผู้ใช้เตรียม, binary ที่อ่านได้ เช่น UnityFramework/แอป และ metadata ที่มีใน bundle |
| ทรัพยากรภาพ/ฉาก/ข้อมูล | Data, AssetBundle, Addressables, StreamingAssets, TextAsset/JSON/config ที่เกี่ยวข้องกับคำถาม |
| ช่วยกู้ชื่อ/เทียบโค้ด | symbols, PDB/dSYM หรือ mapping ที่มากับ build ถ้ามี |

พาธด้านบนเป็นรูปแบบที่พบบ่อย ต้อง inventory ไฟล์จริงก่อนเลือก ห้ามจับ metadata กับ native binary ต่าง build มารวมกันแล้วสรุปว่าตรงกันจากชื่อไฟล์

## เครื่องมืออ่าน IL2CPP ที่มีใน session นี้

`inspect_il2cpp_metadata` รับ `path` และเลือกส่ง `binary_path` กับ architecture `arm64`/`amd64` ได้ เครื่องมือที่ประกาศอยู่รองรับ unencrypted metadata versions **24, 27, 29, 31, 39** และ binary 64-bit little-endian Mach-O/PE/ELF ตาม layout ที่รองรับ

สิ่งที่อ่านได้ขึ้นกับข้อมูลที่ให้: images/assemblies, type/method names, member tables, string literals, nested types และเมื่อจับคู่ binary ที่รองรับจึงอาจตาม type/signature และ native method address ได้ ผลแบบ summary เก็บ Evidence สำหรับเปิดหน้ารายการเพิ่มผ่าน `inspect_analysis_view`

ตัวอย่าง input ของ MCP (แทนด้วยไฟล์ที่มีอยู่จริง):

```json
{
  "path": "/absolute/path/global-metadata.dat",
  "binary_path": "/absolute/path/GameAssembly.dll",
  "binary_architecture": "amd64",
  "detail": "summary"
}
```

Metadata อย่างเดียวไม่คืนโค้ด C# ต้นฉบับหรือที่อยู่ native method ครบทุกตัว ตาราง native กับชื่อ method เป็นหลักฐาน static ไม่พิสูจน์ว่าทางเดินโค้ดนั้นถูกเรียกจริง Generic instances มีข้อจำกัดแยกตาม version/layout และ metadata ที่เข้ารหัสหรือ obfuscation อาจอ่านไม่ได้

## วิเคราะห์ระบบอะไรได้บ้าง

ใช้ตามคำถามที่ผู้ใช้เลือก เช่น โครงคลาส ข้อมูลไอเทม/สูตร เงื่อนไขปลดล็อค inventory/save layout การไหลของ scene/UI ระบบการผลิต เควส เวลา หรือ movement เท่าที่ binary/metadata/resource มีหลักฐานรองรับ

- มี source C# ครบ: อ่าน source ตามปกติก่อน ไม่ต้องผ่าน Ghidra
- Managed DLL: เริ่มด้วย `inspect_managed_artifact`/`inspect_managed_members` ตามเครื่องมือที่มี
- IL2CPP: เริ่ม metadata และ binary ที่เลือก → ตาม method address → ใช้ Ghidra ตรวจ native pseudocode/call references ที่เกี่ยวข้อง
- ไฟล์ทรัพยากร: inventory/extract แบบมีขอบเขต แล้วอ่าน config/ข้อมูลประกอบ
- ข้อสรุปเกี่ยวกับพฤติกรรมขณะเล่นต้องมี runtime evidence เพิ่มจาก static เมื่อจำเป็น การเปิด/รัน/attach เกมต้องตรงขอบเขตคำขอ

เก็บ Evidence ID, digest ของไฟล์, version, ที่อยู่ method และข้อจำกัดประกอบผลเสมอ ไม่รับรองการกู้ source/assets ทั้งเกมจาก metadata ไฟล์เดียว

## กลับมาใช้งานหรือแก้ปัญหา

1. หาก tools มีอยู่แล้ว ใช้เครื่องมือที่ตอบคำถามโดยตรง ไม่ setup ซ้ำทุกครั้ง
2. หากไม่เห็น tools ตรวจการโหลด MCP/registration และอ่านข้อผิดพลาดจาก client
3. คำสั่งวินิจฉัยจาก runtime ที่ติดตั้งไว้ โดยไม่พึ่ง `rea` ใน PATH:

```bash
/Users/yamujung/.codex/tools/node-v24.22.1-darwin-arm64/bin/node \
  /Users/yamujung/.codex/tools/rea-il2cpp-03ed0c6/scripts/rea.mjs \
  doctor --client codex --json
```

4. แยก host tool timeout (Codex หน่วยวินาที) จาก provider analysis timeout (บางค่าหน่วยมิลลิวินาที) ไม่ยิงงานวิเคราะห์เดิมซ้ำเมื่อยังไม่รู้ว่างานเก่าหยุดหรือยัง
5. หากต้องแก้ config/เปลี่ยน runtime ให้เตรียม diff/สำรองตาม workflow ของ skill และรีสตาร์ต MCP หลังเปลี่ยนค่า startup ตามที่จำเป็น

REA ใช้กับเกม/ไฟล์ที่ผู้ใช้มีสิทธิ์วิเคราะห์ ผลที่ได้ช่วยอธิบายและออกแบบใหม่ ส่วนงานในเอกสารชุดนี้ไม่ได้เปิดวิเคราะห์ binary เกมบุคคลที่สามเพิ่ม
