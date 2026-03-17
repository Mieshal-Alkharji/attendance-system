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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. Live Dashboard Logic
window.addEventListener('load', () => {
    const tableBody = document.getElementById("attendanceBody");
    const q = query(collection(db, "attendance"), orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        if (!tableBody) return;
        tableBody.innerHTML = "";
        snapshot.forEach((doc) => {
            const data = doc.data();
            tableBody.innerHTML += `
                <tr>
                    <td>${data.name || 'N/A'}</td>
                    <td>${data.studentID || 'N/A'}</td>
                    <td>${data.time || 'N/A'}</td>
                </tr>`;
        });
    });
});

// 2. NEW: Refreshing QR Generation (Every 15 Seconds)
let qrInterval;

window.generateQR = function() {
    const qrDiv = document.getElementById("qrcode");
    if (!qrDiv) return;

    // Clear any existing timer to avoid multiple QRs fighting each other
    if (qrInterval) clearInterval(qrInterval);

    // Function to create the actual QR
    const createTokenizedQR = () => {
        qrDiv.innerHTML = "";

        // This number changes exactly every 15 seconds
        const timeBlock = Math.floor(Date.now() / 15000);
        const githubStudentUrl = "https://mieshal-alkharji.github.io/attendance-system/student.html";

        // Add the timeBlock to the data so the student's phone knows when it was made
        const sessionData = {
            isAttendanceQR: true,
            t: timeBlock
        };

        const finalUrl = `${githubStudentUrl}?data=${encodeURIComponent(JSON.stringify(sessionData))}`;

        if (typeof QRCode !== "undefined") {
            new QRCode(qrDiv, {
                text: finalUrl,
                width: 220,
                height: 220,
                colorDark : "#2c3e50",
                correctLevel : QRCode.CorrectLevel.H
            });
            console.log("New QR Generated. Block:", timeBlock);
        }
    };

    // Run once immediately
    createTokenizedQR();

    // Then repeat every 15 seconds
    qrInterval = setInterval(createTokenizedQR, 15000);

    alert("Smart QR Started: Code will refresh every 15 seconds to prevent cheating.");
};

// 3. Download CSV
window.downloadCSV = async function() {
    const querySnapshot = await getDocs(collection(db, "attendance"));
    let csv = "Student Name,Student ID,Time\n";
    querySnapshot.forEach(doc => {
        const d = doc.data();
        csv += `${d.name},${d.studentID},${d.time}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Attendance_Report.csv";
    a.click();
};

// 4. Clear Records
window.clearRecords = async function() {
    if(confirm("Delete all attendance data?")) {
        const querySnapshot = await getDocs(collection(db, "attendance"));
        for (const docSnap of querySnapshot.docs) {
            await deleteDoc(docSnap.ref);
        }
    }
};
