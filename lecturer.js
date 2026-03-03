// Security Check: Only allow Lecturers
window.onload = function() {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user || user.role !== "lecturer") {
        alert("Access Denied! Please login as a Lecturer.");
        window.location.href = "index.html";
    } else {
        // Load the attendance list if they are authorized
        viewAttendanceSheet();
    }
};

function generateQR() {
    const qrDiv = document.getElementById("qrcode");
    qrDiv.innerHTML = "";
    const sessionData = { course: "Advanced AI", expires: Date.now() + 120000 };

    new QRCode(qrDiv, {
        text: JSON.stringify(sessionData),
        width: 200, height: 200
    });
}

function viewAttendanceSheet() {
    const data = JSON.parse(localStorage.getItem("attendanceDB")) || [];
    const table = document.getElementById("attendanceTable");
    table.innerHTML = `<tr><th>Name</th><th>ID</th><th>Time</th></tr>` +
        data.map(r => `<tr><td>${r.name}</td><td>${r.id}</td><td>${r.time}</td></tr>`).join('');
}

function downloadCSV() {
    const data = JSON.parse(localStorage.getItem("attendanceDB")) || [];
    let csv = "Student Name,ID,Time\n" + data.map(r => `${r.name},${r.id},${r.time}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Attendance.csv";
    a.click();
}

function clearRecords() {
    if(confirm("Delete all records?")) {
        localStorage.removeItem("attendanceDB");
        viewAttendanceSheet();
    }
}
function generateQR() {
    const qrDiv = document.getElementById("qrcode");
    qrDiv.innerHTML = "";

    // Replace 'your-ip-address' with your computer's IP (e.g., 192.168.1.5)
    // or your hosted URL
    // This tells the QR code to use the current website's address automatically
    const baseUrl = window.location.origin + window.location.pathname.replace('lecturer.html', 'student.html');

    const sessionData = {
        course: "Advanced AI",
        expires: Date.now() + 120000
    };

    // The QR text is now a URL with parameters
    const qrLink = `${baseUrl}?data=${encodeURIComponent(JSON.stringify(sessionData))}`;

    new QRCode(qrDiv, {
        text: qrLink,
        width: 250,
        height: 250
    });

    console.log("QR Link generated:", qrLink);
}