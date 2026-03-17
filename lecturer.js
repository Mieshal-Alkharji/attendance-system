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

// 1. Live Dashboard Logic - (Updates table view)
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

    createTokenizedQR();
    qrInterval = setInterval(createTokenizedQR, 15000);
    alert("Smart QR Started: Code will refresh every 15 seconds.");
};

// 3. Download CSV - (Updated to include the Date)
window.downloadCSV = async function() {
    try {
        const querySnapshot = await getDocs(collection(db, "attendance"));
        
        // CSV Headers with Date included
        let csv = "Date,Student Name,Student ID,Time\n";
        
        querySnapshot.forEach(doc => {
            const d = doc.data();
            
            // Format the date from the timestamp
            const fullDate = d.timestamp ? new Date(d.timestamp).toLocaleDateString() : new Date().toLocaleDateString();
            
            // Clean strings to ensure no commas break the CSV columns
            const cleanName = (d.name || "N/A").replace(/,/g, "");
            const cleanID = (d.studentID || "N/A").replace(/,/g, "");
            const cleanTime = (d.time || "N/A").replace(/,/g, "");

            csv += `${fullDate},${cleanName},${cleanID},${cleanTime}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        
        // Name the file with today's date
        const todayStr = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `Attendance_Report_${todayStr}.csv`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error("Error generating CSV:", error);
        alert("Failed to export data.");
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
