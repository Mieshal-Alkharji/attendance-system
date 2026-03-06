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
    // Target the tbody specifically to avoid flickering headers
    const tableBody = document.getElementById("attendanceBody");
    const q = query(collection(db, "attendance"), orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        if (!tableBody) return;
        tableBody.innerHTML = ""; // Clear only the body
        snapshot.forEach((doc) => {
            const data = doc.data();
            tableBody.innerHTML += `
                <tr>
                    <td>${data.name || 'N/A'}</td>
                    <td>${data.studentID || 'N/A'}</td>
                    <td>${data.time || 'N/A'}</td>
                    <td>${data.course || 'N/A'}</td>
                </tr>`;
        });
    });
});

// 2. QR Generation - THE CRITICAL FIX FOR YOUR PHONE
window.generateQR = function() {
    const qrDiv = document.getElementById("qrcode");
    if (!qrDiv) return;
    qrDiv.innerHTML = "";

    // REPLACE 'your-username' and 'your-repo' with your actual GitHub details
    // Example: "https://mieshal.github.io/attendance-app/student.html"
    const githubStudentUrl = "https://mieshal-alkharji.github.io/attendance-system//attendance-system/student.html";

    const sessionData = {
        course: "Advanced AI",
        expires: Date.now() + 600000
    };

    const finalUrl = `${githubStudentUrl}?data=${encodeURIComponent(JSON.stringify(sessionData))}`;

    if (typeof QRCode !== "undefined") {
        new QRCode(qrDiv, {
            text: finalUrl,
            width: 220,
            height: 220
        });
        console.log("QR Pointing to:", finalUrl);
    } else {
        alert("QR Library missing! Check your lecturer.html <script> tags.");
    }
};

// 3. Download CSV
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

// 4. Clear Records
window.clearRecords = async function() {
    if(confirm("Delete all attendance data?")) {
        const querySnapshot = await getDocs(collection(db, "attendance"));
        querySnapshot.forEach(async (docSnap) => {
            await deleteDoc(docSnap.ref);
        });
    }
};
