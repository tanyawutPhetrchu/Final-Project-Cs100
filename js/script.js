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

function loadData() {
    return JSON.parse(localStorage.getItem("portfolios")) || {};
}

// เก็บข้อมูลลง localStorage
function saveData(data) {
    localStorage.setItem("portfolios", JSON.stringify(data));
}

// แสดงข้อมูลบนหน้าเว็บ
function render() {
    const data = loadData();
    let html = "";
    for (const studentId in data) {
        const p = data[studentId].profile;

        html += `
        <div class="card mb-5 shadow border-0 rounded-4 overflow-hidden">
            <div class="card-header text-white p-3 fw-bold fs-5" style="background-color:#D4621A;">
                👤 ${p.name} <span class="fw-normal fs-6">(${p.studentId})</span> - <span class="fw-light">${p.email}</span>
            </div>
            <div class="card-body p-4 bg-light">
                <!-- ส่วน User Profile แบบกล่องข้อความแยกย่อย -->
                <div class="row g-2 mb-4">
                    <div class="col-md-4">
                        <div class="p-3 border rounded bg-white h-100 shadow-sm">
                            <span class="text-muted small fw-bold d-block mb-1"> WHAT I ENJOY</span>
                            <span>${p.whatIEnjoy}</span>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-3 border rounded bg-white h-100 shadow-sm">
                            <span class="text-muted small fw-bold d-block mb-1"> WHAT I'VE TRIED</span>
                            <span>${p.whatITried}</span>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-3 border rounded bg-white h-100 shadow-sm">
                            <span class="text-muted small fw-bold d-block mb-1"> WHAT I'M CURIOUS ABOUT</span>
                            <span>${p.whatICurious}</span>
                        </div>
                    </div>
                </div>

                <hr class="mb-4 text-secondary">
                <h5 class="fw-bold mb-3" style="color: #D4621A;"> Portfolio Items</h5>
                <div class="row g-4">`;

        for (const it of data[studentId].items) {
            html += `
                <div class="col-md-6">
                    <div class="border-0 shadow-sm rounded-3 p-4 bg-white h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h5 class="fw-bold text-dark m-0">${it.title}</h5>
                                <span class="badge bg-warning text-dark">${it.id}</span>
                            </div>
                            <p class="text-muted small mb-2"><b>Type:</b> ${it.type} &nbsp;|&nbsp; <b>Date:</b> ${it.date}</p>
                            <p class="mb-1"><b>Role:</b> ${it.role}</p>
                            <p class="mb-2"><b>Skills:</b> <span class="badge bg-secondary text-light">${it.skills.join("</span> <span class='badge bg-secondary text-light'>")}</span></p>
                            <p class="text-secondary">${it.description}</p>
                            
                            <div class="bg-light p-3 rounded-3 mt-3 border">
                                <p class="mb-1 small"><b>What I did:</b> ${it.reflection.whatIDid}</p>
                                <p class="mb-1 small"><b>What I learned:</b> ${it.reflection.whatILearned}</p>
                                <p class="mb-1 small"><b>Challenge:</b> ${it.reflection.challenge}</p>
                                <p class="mb-0 small"><b>Next step:</b> ${it.reflection.nextStep}</p>
                            </div>
                        </div>
                        <div class="mt-3 text-end">
                            <a href="${it.evidence[0]}" target="_blank" class="btn btn-sm text-white fw-bold px-3 py-1" style="background-color: #D4621A;">🔗 View Evidence</a>
                        </div>
                    </div>
                </div>`;
        }

        html += `</div></div></div>`;
    }

    if (html === "") {
        html = "<p class='text-center text-muted fs-5'>ยังไม่มี Portfolio Item บันทึกไว้</p>";
    }
    listEl.innerHTML = html;
}

// Submit
form.addEventListener("submit", function (e) {
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
        showModal("กรอกข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบทุกช่อง", false);
        return;
    }
    if (!email.includes("@")) {
        showModal("รูปแบบ Email ไม่ถูกต้อง", "Email ต้องมีเครื่องหมาย @ ", false);
        return;
    }
    if (isNaN(studentId)) {
        showModal("รูปแบบ Student ID ไม่ถูกต้อง", "Student ID ต้องเป็นตัวเลขเท่านั้น", false);
        return;
    }
    if (!evidence.startsWith("http")) {
        showModal("รูปแบบลิงก์ไม่ถูกต้อง", "Evidence ต้องเป็นลิงก์ที่ขึ้นต้นด้วย http ", false);
        return;
    }

    // 3. จัดข้อมูลเป็น Object
    const data = loadData();

    // ถ้าเป็นนักศึกษาคนใหม่ ให้สร้างที่เก็บของคนนั้นก่อน
    if (data[studentId] === undefined) {
        data[studentId] = { profile: {}, items: [] };
    }

    data[studentId].profile = {
        name: name,
        email: email,
        studentId: studentId,
        whatIEnjoy: whatIEnjoy,
        whatITried: whatITried,
        whatICurious: whatICurious
    };

    // ["html", "css", "js"]
    const skillList = skills.split(",").map(function (s) {
        return s.trim();
    });

    const items = data[studentId].items;
    const newItem = {
        id: "item" + String(items.length + 1).padStart(3, "0"), // item001, item002, ...
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
    };
    items.push(newItem);

    // 4. บันทึกลง localStorage
    saveData(data);

    // 5. แสดงผล
    render();
    showModal("บันทึกสำเร็จ!", "สร้างและบันทึกข้อมูล Portfolio เรียบร้อยแล้ว", true);
});

// เปิดหน้าเว็บ / Refresh แล้วแสดงข้อมูลที่เคยบันทึกไว้
render();