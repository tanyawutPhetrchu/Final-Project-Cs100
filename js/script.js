const form = document.getElementById("item-form");
const listEl = document.getElementById("portfolio-list");

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
        <div class="card mb-4">
            <div class="card-header text-white" style="background-color:#D4621A;">
                <b>${p.name}</b> (${p.studentId}) - ${p.email}
            </div>
            <div class="card-body">
                <p><b>What I Enjoy:</b> ${p.whatIEnjoy}</p>
                <p><b>What I've Tried:</b> ${p.whatITried}</p>
                <p><b>What I'm Curious About:</b> ${p.whatICurious}</p>
                <div class="row g-3">`;

        for (const it of data[studentId].items) {
            html += `
                <div class="col-md-6">
                    <div class="border rounded p-3 bg-white h-100">
                        <h5>${it.title} (${it.id})</h5>
                        <p>Type: ${it.type} | Date: ${it.date}</p>
                        <p>Role: ${it.role}</p>
                        <p>Skills: ${it.skills.join(", ")}</p>
                        <p>${it.description}</p>
                        <hr>
                        <p>What I did: ${it.reflection.whatIDid}</p>
                        <p>What I learned: ${it.reflection.whatILearned}</p>
                        <p>Challenge: ${it.reflection.challenge}</p>
                        <p>Next step: ${it.reflection.nextStep}</p>
                        <a href="${it.evidence[0]}" target="_blank">Evidence</a>
                    </div>
                </div>`;
        }

        html += `</div></div></div>`;
    }

    if (html === "") {
        html = "<p>ยังไม่มี Portfolio Item</p>";
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
        alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
        return;
    }
    if (!email.includes("@")) {
        alert("Email ต้องมีเครื่องหมาย @");
        return;
    }
    if (isNaN(studentId)) {
        alert("Student ID ต้องเป็นตัวเลขเท่านั้น");
        return;
    }
    if (!evidence.startsWith("http")) {
        alert("Evidence ต้องเป็นลิงก์ที่ขึ้นต้นด้วย http");
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
    alert("บันทึกแล้ว!");
});

// เปิดหน้าเว็บ / Refresh แล้วแสดงข้อมูลที่เคยบันทึกไว้
render();