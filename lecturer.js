import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, deleteDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// 1. Real-Time Dashboard: Listen for student check-ins
window.addEventListener('load', () => {
    const tableBody = document.getElementById("attendanceBody");
    const q = query(collection(db, "attendance"), orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        tableBody.innerHTML = ""; // Clear list
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

// 2. Part C: QR Generation Logic
window.generateQR = function() {
    const qrDiv = document.getElementById("qrcode");
    qrDiv.innerHTML = "";

    const baseUrl = window.location.origin + window.location.pathname.replace('lecturer.html', 'student.html');
    const sessionData = {
        course: "Advanced AI",
        expires: Date.now() + 600000 // 10 minutes
    };

    const finalUrl = `${baseUrl}?data=${encodeURIComponent(JSON.stringify(sessionData))}`;

    new QRCode(qrDiv, {
        text: finalUrl,
        width: 220,
        height: 220
    });
    console.log("QR Session Active:", finalUrl);
};

// 3. Export to Excel (CSV)
window.downloadCSV = async function() {
    const querySnapshot = await getDocs(collection(db, "attendance"));
    if (querySnapshot.empty) return alert("No data to export!");

    let csvContent = "Name,ID,Time,Course\n";
    querySnapshot.forEach((doc) => {
        const d = doc.data();
        csvContent += `${d.name},${d.studentID},${d.time},${d.course}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Attendance_Report_${new Date().toLocaleDateString()}.csv`;
    a.click();
};

// 4. Clear Database Records
window.clearRecords = async function() {
    if (confirm("Are you sure you want to delete all attendance records for today?")) {
        const querySnapshot = await getDocs(collection(db, "attendance"));
        querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
        alert("Database Cleared.");
    }
};
