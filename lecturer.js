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

// 2. Refreshing QR Generation (Every 15 Seconds)
let qrInterval;
window.generateQR = function() {
    const qrDiv = document.getElementById("qrcode");
    if (!qrDiv) return;
    if (qrInterval) clearInterval(qrInterval);

    const createTokenizedQR = () => {
        qrDiv.innerHTML = "";
        const timeBlock = Math.floor(Date.now() / 15000);
        const githubStudentUrl = "https://mieshal-alkharji.github.io/attendance-system/student.html";
        const sessionData = { isAttendanceQR: true, t: timeBlock };
        const finalUrl = `${githubStudentUrl}?data=${encodeURIComponent(JSON.stringify(sessionData))}`;

        if (typeof QRCode !== "undefined") {
            new QRCode(qrDiv, {
                text: finalUrl,
                width: 220,
                height: 220,
                colorDark : "#2c3e50",
                correctLevel : QRCode.CorrectLevel.H
            });
        }
    };
    createTokenizedQR();
    qrInterval = setInterval(createTokenizedQR, 15000);
    alert("Smart QR Started: Refreshing every 15 seconds.");
};

// 3. DOWNLOAD CSV - THE FIXED VERSION
window.downloadCSV = async function() {
    try {
        console.log("Starting CSV Generation...");
        const querySnapshot = await getDocs(collection(db, "attendance"));
        
        // Ensure the Header has the Date column
        let csv = "Date,Student Name,Student ID,Time\n";
        
        querySnapshot.forEach(doc => {
            const d = doc.data();
            
            // LOGIC: Check if timestamp exists, otherwise use today's date
            let displayDate = "";
            if (d.timestamp) {
                displayDate = new Date(d.timestamp).toLocaleDateString();
            } else {
                displayDate = new Date().toLocaleDateString(); // Fallback to now
            }
            
            // Clean data to remove commas that break CSV structure
            const cleanName = (d.name || "N/A").replace(/,/g, "");
            const cleanID = (d.studentID || "N/A").replace(/,/g, "");
            const cleanTime = (d.time || "N/A").replace(/,/g, "");

            // Add the row to the CSV string
            csv += `${displayDate},${cleanName},${cleanID},${cleanTime}\n`;
        });

        // Trigger the download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        const todayFile = new Date().toISOString().split('T')[0];
        link.setAttribute("href", url);
        link.setAttribute("download", `Attendance_Report_${todayFile}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log("CSV Downloaded!");
    } catch (error) {
        console.error("Error generating CSV:", error);
        alert("Failed to export. Check your internet or console.");
    }
};

// 4. Clear Records
window.clearRecords = async function() {
    if(confirm("Delete all attendance data? This cannot be undone.")) {
        const querySnapshot = await getDocs(collection(db, "attendance"));
        for (const docSnap of querySnapshot.docs) {
            await deleteDoc(docSnap.ref);
        }
    }
};
