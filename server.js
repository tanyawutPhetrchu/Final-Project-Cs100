const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "portfolios.json");

// ตรวจสอบและสร้างโฟลเดอร์ data/ และไฟล์ portfolios.json อัตโนมัติหากยังไม่มี
function ensureDataFile() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, "{}", "utf8");
    }
}

function readPortfolios() {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw || "{}");
}

function writePortfolios(data) {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ฟังก์ชันช่วยออก Item ID ใหม่ไม่ให้ซ้ำ (item001, item002, ...)
function generateNextItemId(items) {
    let maxNum = 0;
    for (const it of items) {
        if (typeof it.id === "string" && /^item\d+$/.test(it.id)) {
            const num = parseInt(it.id.replace("item", ""), 10);
            if (num > maxNum) maxNum = num;
        }
    }
    return "item" + String(maxNum + 1).padStart(3, "0");
}

// ฟังก์ชันตรวจสอบความถูกต้องของ Item (ใช้ร่วมกันทั้งตอนสร้างใหม่และตอน Import)
function validateItem(item) {
    if (!item || typeof item !== "object") {
        return "ข้อมูล Portfolio Item ไม่ถูกต้อง";
    }

    const requiredFields = ["title", "type", "date", "role", "description"];
    for (const field of requiredFields) {
        if (typeof item[field] !== "string" || item[field].trim() === "") {
            return `กรุณากรอกข้อมูล ${field} ให้ครบถ้วน`;
        }
    }

    if (!Array.isArray(item.skills) || item.skills.length === 0 || item.skills.some(s => typeof s !== "string" || s.trim() === "")) {
        return "กรุณาระบุ Skills อย่างน้อย 1 รายการ";
    }

    if (!item.reflection || typeof item.reflection !== "object") {
        return "ข้อมูล Reflection ไม่ครบถ้วน";
    }

    const refFields = ["whatIDid", "whatILearned", "challenge", "nextStep"];
    for (const rf of refFields) {
        if (typeof item.reflection[rf] !== "string" || item.reflection[rf].trim() === "") {
            return `กรุณากรอกข้อมูล Reflection (${rf}) ให้ครบถ้วน`;
        }
    }

    if (!Array.isArray(item.evidence) || item.evidence.length === 0 || typeof item.evidence[0] !== "string") {
        return "กรุณาระบุลิงก์ Evidence";
    }

    const evidenceUrl = item.evidence[0].trim();
    if (!evidenceUrl.startsWith("http://") && !evidenceUrl.startsWith("https://")) {
        return "Evidence ต้องเป็นลิงก์ที่ขึ้นต้นด้วย http:// หรือ https://";
    }

    return null; // ผ่านการตรวจสอบ
}

app.use(express.json());

// เปิดให้เข้าถึงไฟล์เว็บได้เฉพาะในโฟลเดอร์ public/ เท่านั้น
app.use(express.static(path.join(__dirname, "public")));

// ดักจับกรณีส่ง JSON ผิดรูปแบบเข้ามาใน Body
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ error: "รูปแบบ JSON ที่ส่งมาไม่ถูกต้อง" });
    }
    next();
});

// GET /api/portfolios : อ่านข้อมูลทั้งหมดส่งให้หน้าเว็บ
app.get("/api/portfolios", (req, res) => {
    try {
        const portfolios = readPortfolios();
        res.json(portfolios);
    } catch (err) {
        res.status(500).json({ error: "ไม่สามารถอ่านข้อมูลจาก Server ได้" });
    }
});

// POST /api/portfolios : ตรวจสอบข้อมูลและบันทึกลงไฟล์
app.post("/api/portfolios", (req, res) => {
    try {
        const body = req.body || {};
        const portfolios = readPortfolios();

        // กรณีที่ 1: Import Item JSON เข้าไปใน Portfolio ของ Student ID ที่ระบุ
        if (body.action === "import") {
            const studentId = String(body.studentId || "").trim();
            if (studentId === "" || !/^\d+$/.test(studentId)) {
                return res.status(400).json({ error: "Student ID ต้องเป็นตัวเลขเท่านั้น" });
            }
            if (!portfolios[studentId]) {
                return res.status(400).json({ error: `ไม่พบข้อมูล Profile ของรหัส ${studentId} กรุณาสร้าง Profile ก่อน Import` });
            }

            const itemError = validateItem(body.item);
            if (itemError) {
                return res.status(400).json({ error: itemError });
            }

            const cleanItem = {
                id: generateNextItemId(portfolios[studentId].items),
                title: body.item.title.trim(),
                type: body.item.type.trim(),
                date: body.item.date.trim(),
                role: body.item.role.trim(),
                description: body.item.description.trim(),
                skills: body.item.skills.map(s => s.trim()),
                reflection: {
                    whatIDid: body.item.reflection.whatIDid.trim(),
                    whatILearned: body.item.reflection.whatILearned.trim(),
                    challenge: body.item.reflection.challenge.trim(),
                    nextStep: body.item.reflection.nextStep.trim()
                },
                evidence: [body.item.evidence[0].trim()]
            };

            portfolios[studentId].items.push(cleanItem);
            writePortfolios(portfolios);

            return res.status(201).json({
                message: "Import Portfolio Item สำเร็จ!",
                data: portfolios
            });
        }

        // กรณีที่ 2: บันทึกจากฟอร์มหลัก (สร้าง/อัปเดต Profile + เพิ่ม Item ใหม่)
        const profile = body.profile || body;
        const item = body.item || {
            title: body.title,
            type: body.type,
            date: body.date,
            role: body.role,
            description: body.description,
            skills: typeof body.skills === "string" ? body.skills.split(",").map(s => s.trim()) : body.skills,
            reflection: {
                whatIDid: body.whatIDid,
                whatILearned: body.whatILearned,
                challenge: body.challenge,
                nextStep: body.nextStep
            },
            evidence: Array.isArray(body.evidence) ? body.evidence : [body.evidence]
        };

        const requiredProfileFields = ["name", "email", "studentId", "whatIEnjoy", "whatITried", "whatICurious"];
        for (const field of requiredProfileFields) {
            if (typeof profile[field] !== "string" || profile[field].trim() === "") {
                return res.status(400).json({ error: `กรุณากรอกข้อมูล ${field} ให้ครบถ้วน` });
            }
        }

        const email = profile.email.trim();
        const studentId = profile.studentId.trim();

        if (!email.includes("@")) {
            return res.status(400).json({ error: "รูปแบบ Email ไม่ถูกต้อง (ต้องมีเครื่องหมาย @)" });
        }

        if (!/^\d+$/.test(studentId)) {
            return res.status(400).json({ error: "Student ID ต้องเป็นตัวเลขเท่านั้น" });
        }

        const itemError = validateItem(item);
        if (itemError) {
            return res.status(400).json({ error: itemError });
        }

        if (!portfolios[studentId]) {
            portfolios[studentId] = { profile: {}, items: [] };
        }

        portfolios[studentId].profile = {
            name: profile.name.trim(),
            email: email,
            studentId: studentId,
            whatIEnjoy: profile.whatIEnjoy.trim(),
            whatITried: profile.whatITried.trim(),
            whatICurious: profile.whatICurious.trim()
        };

        const cleanItem = {
            id: generateNextItemId(portfolios[studentId].items),
            title: item.title.trim(),
            type: item.type.trim(),
            date: item.date.trim(),
            role: item.role.trim(),
            description: item.description.trim(),
            skills: item.skills.map(s => s.trim()),
            reflection: {
                whatIDid: item.reflection.whatIDid.trim(),
                whatILearned: item.reflection.whatILearned.trim(),
                challenge: item.reflection.challenge.trim(),
                nextStep: item.reflection.nextStep.trim()
            },
            evidence: [item.evidence[0].trim()]
        };

        portfolios[studentId].items.push(cleanItem);
        writePortfolios(portfolios);

        return res.status(201).json({
            message: "สร้างและบันทึกข้อมูล Portfolio เรียบร้อยแล้ว",
            data: portfolios
        });
    } catch (err) {
        return res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลบน Server" });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    ensureDataFile();
    console.log(`Server running at http://localhost:${PORT}`);
});