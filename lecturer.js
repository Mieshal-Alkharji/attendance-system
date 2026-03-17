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
                text: finalUrl, width: 220, height: 220, colorDark : "#2c3e50", correctLevel : QRCode.CorrectLevel.H
            });
        }
    };
    createTokenizedQR();
    qrInterval = setInterval(createTokenizedQR, 15000);
    alert("Smart QR Started: Refreshing every 15 seconds.");
};

// 3. THE FINAL FIXED DOWNLOAD CSV
window.downloadCSV = async function() {
    try {
        const querySnapshot = await getDocs(collection(db, "attendance"));
        
        // Ensure "Date" is the very first thing in the header string
        let csvContent = "Date,Student Name,Student ID,Time\n";
        
        querySnapshot.forEach(doc => {
            const d = doc.data();
            
            // Try to get date from timestamp, if not, use today's date string
            let rowDate = "";
            if (d.timestamp) {
                const dateObj = new Date(d.timestamp);
                rowDate = dateObj.getFullYear() + "-" + (dateObj.getMonth() + 1) + "-" + dateObj.getDate();
            } else {
                const now = new Date();
                rowDate = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
            }
            
            const name = (d.name || "N/A").replace(/,/g, "");
            const id = (d.studentID || "N/A").replace(/,/g, "");
            const time = (d.time || "N/A").replace(/,/g, "");

            // Combine into a CSV row
            csvContent += `${rowDate},${name},${id},${time}\n`;
        });

        // Use a more robust download method
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", "Attendance_Report_Final.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error("CSV Error:", error);
        alert("Download failed. See console.");
    }
};

// 4. Clear Records
window.clearRecords = async function() {
    if(confirm("Delete all data?")) {
        const querySnapshot = await getDocs(collection(db, "attendance"));
        for (const docSnap of querySnapshot.docs) {
            await deleteDoc(docSnap.ref);
        }
    }
};
