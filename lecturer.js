import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBTwzS4-UbmvDKLeI4Kyv_tWvvOTVTF-ug",
    authDomain: "attendancesystem-16e5c.firebaseapp.com",
    projectId: "attendancesystem-16e5c",
    storageBucket: "attendancesystem-16e5c.firebasestorage.app",
    messagingSenderId: "33422610799",
    appId: "1:33422610799:web:ba428fb6b648de9942189a",
    measurementId: "G-8VBJE6LDTY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. Live Dashboard Logic (Updates table automatically)
window.addEventListener('load', () => {
    const tableBody = document.getElementById("attendanceBody") || document.getElementById("attendanceTable");
    const q = query(collection(db, "attendance"), orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        // Keeps the header and clears the rows
        tableBody.innerHTML = `<tr><th>Name</th><th>ID</th><th>Time</th><th>Course</th></tr>`;
        snapshot.forEach((doc) => {
            const data = doc.data();
            tableBody.innerHTML += `
                <tr>
                    <td>${data.name}</td>
                    <td>${data.studentID}</td>
                    <td>${data.time}</td>
                    <td>${data.course}</td>
                </tr>`;
        });
    });
});

// 2. QR Generation (Attached to window for HTML button)
window.generateQR = function() {
    const qrDiv = document.getElementById("qrcode");
    if (!qrDiv) return;
    qrDiv.innerHTML = "";

    // Dynamic URL for GitHub/Live Hosting
    const baseUrl = window.location.origin + window.location.pathname.replace('lecturer.html', 'student.html');

    const sessionData = {
        course: "Advanced AI",
        expires: Date.now() + 600000
    };

    const finalUrl = `${baseUrl}?data=${encodeURIComponent(JSON.stringify(sessionData))}`;

    if (typeof QRCode !== "undefined") {
        new QRCode(qrDiv, {
            text: finalUrl,
            width: 220,
            height: 220
        });
        console.log("QR Link:", finalUrl);
    } else {
        alert("QR Library missing! Check lecturer.html script tags.");
    }
};

// 3. Download CSV Function
window.downloadCSV = async function() {
    const querySnapshot = await getDocs(collection(db, "attendance"));
    let csv = "Name,ID,Time,Course\n";
    querySnapshot.forEach(doc => {
        const d = doc.data();
        csv += `${d.name},${d.studentID},${d.time},${d.course}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Attendance_Report.csv";
    a.click();
};
