const form = document.getElementById("item-form");
const listEl = document.getElementById("portfolio-list");

function showModal(title, message, isSuccess = false) {
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const modalHeader = document.getElementById("modalHeader");

    modalTitle.textContent = title;
    modalBody.textContent = message;

    if (isSuccess) {
        modalHeader.style.backgroundColor = "#28a745";
    } else {
        modalHeader.style.backgroundColor = "#D4621A";
    }

    const modalEl = document.getElementById("statusModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}
// อ่านข้อมูลทั้งหมดจาก Server
async function loadData() {
    const res = await fetch("/api/portfolios");
    return await res.json();
}
//ฟังก์ชันดาวน์โหลด JSON
async function downloadJSON(studentId) {
    const data = await loadData();
    const portfolio = data[studentId];
    if (portfolio === undefined) return;

    const text = JSON.stringify(portfolio, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio-" + studentId + ".json";
    a.click();

    URL.revokeObjectURL(url);
}
// คัดลอก JSON ของ Item ที่เลือก
async function copyItemJSON(studentId, itemId) {
    const data = await loadData();
    const item = data[studentId].items.find(function (it) {
        return it.id === itemId;
    });
    if (item === undefined) return;

    const box = document.getElementById("json-" + studentId + "-" + itemId);
    box.value = JSON.stringify(item, null, 2);
    box.classList.remove("d-none");
    box.select();

    const ok = document.execCommand("copy");
    if (ok) {
        showModal("Copied!", "Item JSON copied successfully. You can now paste it into the Import field.", true);
    } else {
        showModal("Copy failed", "The text is selected in the box. Press Ctrl+C to copy it yourself.", false);
    }
}
// แสดงข้อมูลบนหน้าเว็บ
async function render() {
    const data = await loadData();
    let html = "";
    for (const studentId in data) {
        const p = data[studentId].profile;

        html += `
        <div class="card mb-5 shadow border-0 rounded-4 overflow-hidden">
            <div class="card-header text-white p-3 fw-bold fs-5" style="background-color:#D4621A;">
                👤 ${esc(p.name)} <span class="fw-normal fs-6">(${esc(p.studentId)})</span> - <span class="fw-light">${esc(p.email)}</span>
            </div>
            <div class="card-body p-4 bg-light">
                <div class="row g-2 mb-4">
                    <div class="col-md-4">
                        <div class="p-3 border rounded bg-white h-100 shadow-sm">
                            <span class="text-muted small fw-bold d-block mb-1"> WHAT I ENJOY</span>
                            <span>${esc(p.whatIEnjoy)}</span>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-3 border rounded bg-white h-100 shadow-sm">
                            <span class="text-muted small fw-bold d-block mb-1"> WHAT I'VE TRIED</span>
                            <span>${esc(p.whatITried)}</span>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-3 border rounded bg-white h-100 shadow-sm">
                            <span class="text-muted small fw-bold d-block mb-1"> WHAT I'M CURIOUS ABOUT</span>
                            <span>${esc(p.whatICurious)}</span>
                        </div>
                    </div>
                </div>

                <hr class="mb-4 text-secondary">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="fw-bold m-0" style="color: #D4621A;"> Portfolio Items</h5>
                    <button class="btn btn-sm text-white" style="background-color: #D4621A;"
                        onclick="downloadJSON('${esc(p.studentId)}')">⬇ Download JSON</button>
                </div>
                <div class="row g-4">`;

        for (const it of data[studentId].items) {
            const skillsHtml = it.skills.map(function (s) {
                return `<span class="badge bg-secondary text-light">${esc(s)}</span>`;
            }).join(" ");

            html += `
                <div class="col-md-6">
                    <div class="border-0 shadow-sm rounded-3 p-4 bg-white h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h5 class="fw-bold text-dark m-0">${esc(it.title)}</h5>
                                <span class="badge bg-warning text-dark">${esc(it.id)}</span>
                            </div>
                            <p class="text-muted small mb-2"><b>Type:</b> ${esc(it.type)} &nbsp;|&nbsp; <b>Date:</b> ${esc(it.date)}</p>
                            <p class="mb-1"><b>Role:</b> ${esc(it.role)}</p>
                            <p class="mb-2"><b>Skills:</b> ${skillsHtml}</p>
                            <p class="text-secondary">${esc(it.description)}</p>

                            <div class="bg-light p-3 rounded-3 mt-3 border">
                                <p class="mb-1 small"><b>What I did:</b> ${esc(it.reflection.whatIDid)}</p>
                                <p class="mb-1 small"><b>What I learned:</b> ${esc(it.reflection.whatILearned)}</p>
                                <p class="mb-1 small"><b>Challenge:</b> ${esc(it.reflection.challenge)}</p>
                                <p class="mb-0 small"><b>Next step:</b> ${esc(it.reflection.nextStep)}</p>
                            </div>
                        </div>
                        <div class="mt-3 text-end">
                            <a href="${esc(it.evidence[0])}" target="_blank" rel="noopener" class="btn btn-sm text-white fw-bold px-3 py-1" style="background-color: #D4621A;">🔗 View Evidence</a>
                        </div>
                                                <div class="mt-3">
                            <button class="btn btn-sm btn-outline-dark"
                                onclick="copyItemJSON('${esc(studentId)}', '${esc(it.id)}')">📋 Copy Item JSON</button>
                            <textarea class="form-control mt-2 d-none" rows="6" readonly
                                id="json-${esc(studentId)}-${esc(it.id)}"></textarea>
                        </div>
                    </div>
                </div>`;
        }

        html += `</div></div></div>`;
    }

    if (html === "") {
        html = "<p class='text-center text-muted fs-5'>No Portfolio Items saved yet.</p>";
    }
    listEl.innerHTML = html;
}

// Submit
form.addEventListener("submit", async function (e)  {
    e.preventDefault(); // กันหน้าเว็บรีเฟรช

    // 1. อ่านข้อมูลจาก Form
    const name = document.getElementById("profileName").value.trim();
    const email = document.getElementById("email").value.trim();
    const studentId = document.getElementById("studentId").value.trim();
    const whatIEnjoy = document.getElementById("whatIEnjoy").value.trim();
    const whatITried = document.getElementById("whatITried").value.trim();
    const whatICurious = document.getElementById("whatICurious").value.trim();
    const title = document.getElementById("title").value.trim();
    const type = document.getElementById("type").value.trim();
    const date = document.getElementById("date").value.trim();
    const role = document.getElementById("role").value.trim();
    const skills = document.getElementById("skills").value.trim();
    const description = document.getElementById("description").value.trim();
    const whatIDid = document.getElementById("whatIDid").value.trim();
    const whatILearned = document.getElementById("whatILearned").value.trim();
    const challenge = document.getElementById("challenge").value.trim();
    const nextStep = document.getElementById("nextStep").value.trim();
    const evidence = document.getElementById("evidence").value.trim();

    // 2. ตรวจสอบข้อมูล
    if (name === "" || email === "" || studentId === "" || whatIEnjoy === "" ||
        whatITried === "" || whatICurious === "" || title === "" || type === "" ||
        date === "" || role === "" || skills === "" || description === "" ||
        whatIDid === "" || whatILearned === "" || challenge === "" ||
        nextStep === "" || evidence === "") {
        showModal("Missing Information", "Please fill in all fields", false);
        return;
    }
    if (!email.includes("@")) {
        showModal("Invalid Email Format", "Email must contain the @ symbol", false);
        return;
    }
    if (isNaN(studentId)) {
        showModal("Invalid Student ID Format", "Student ID must be a number", false);
        return;
    }
    if (!evidence.startsWith("http")) {
        showModal("Invalid Evidence Format", "Evidence must be a URL starting with http", false);
        return;
    }

        // 3. จัดข้อมูลเป็น Object
    const skillList = skills.split(",").map(function (s) {
        return s.trim();
    });

    const body = {
        profile: {
            name: name,
            email: email,
            studentId: studentId,
            whatIEnjoy: whatIEnjoy,
            whatITried: whatITried,
            whatICurious: whatICurious
        },
        item: {
            title: title,
            type: type,
            date: date,
            role: role,
            description: description,
            skills: skillList,
            reflection: {
                whatIDid: whatIDid,
                whatILearned: whatILearned,
                challenge: challenge,
                nextStep: nextStep
            },
            evidence: [evidence]
        }
    };

    // 4. ส่งให้ Server บันทึก
    try {
        const res = await fetch("/api/portfolios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const result = await res.json();

        if (!res.ok) {
            showModal("Save Failed", result.error, false);
            return;
        }
    } catch (err) {
        showModal("Failed to Connect to Server", "Please try again later", false);
        return;
    }

        // 5. แสดงผล
    await render();
    showModal("Save Successful!", "Portfolio data saved successfully.", true);
});
// แสดงข้อความในป๊อปอัพ Import
function showImportMessage(message, isSuccess) {
    const box = document.getElementById("importMessage");
    box.textContent = message;
    box.className = isSuccess ? "alert alert-success" : "alert alert-danger";
}

// ปิดป๊อปอัพแล้วซ่อนข้อความเก่า
document.getElementById("importModal").addEventListener("hidden.bs.modal", function () {
    document.getElementById("importMessage").className = "alert d-none";
});

// Import Item JSON
document.getElementById("importBtn").addEventListener("click", async function () {
    const studentId = document.getElementById("importStudentId").value.trim();
    const text = document.getElementById("importJson").value.trim();

    if (studentId === "" || text === "") {
        showImportMessage("Please enter Student ID and paste JSON", false);
        return;
    }

    let item;
    try {
        item = JSON.parse(text);
    } catch (err) {
        showImportMessage("Invalid JSON format. Please copy the entire JSON block from { to }", false);
        return;
    }

    try {
        const res = await fetch("/api/portfolios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "import",
                studentId: studentId,
                item: item
            })
        });
        const result = await res.json();

        if (!res.ok) {
            showImportMessage(result.error, false);
            return;
        }
    } catch (err) {
        showImportMessage("Failed to connect to server. Please try again later.", false);
        return;
    }

    document.getElementById("importJson").value = "";
    await render();
    showImportMessage("Import Successful! Close this window and view the new item in Saved Portfolios.", true);
});
// เปิดหน้าเว็บ / Refresh แล้วแสดงข้อมูลที่เคยบันทึกไว้
render();

// ฟังก์ชันสำหรับป้องกัน XSS
function esc(text) {
    const d = document.createElement("div");
    d.textContent = text;
    return d.innerHTML
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
