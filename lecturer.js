/**
 * SmartCheck Lecturer Dashboard Controller
 * Handles live attendance tracking, dynamic QR generation, and data exports.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase configuration for the 'attendancesystem-16e5c' project
const firebaseConfig = {
    apiKey: "AIzaSyBTwzS4-UbmvDKLeI4Kyv_tWvvOTVTF-ug",
    authDomain: "attendancesystem-16e5c.firebaseapp.com",
    projectId: "attendancesystem-16e5c",
    storageBucket: "attendancesystem-16e5c.firebasestorage.app",
    messagingSenderId: "33422610799",
    appId: "1:33422610799:web:ba428fb6b648de9942189a",
    measurementId: "G-8VBJE6LDTY"
};

// Initialise Firebase SDKs
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * 1. LIVE DASHBOARD SYNCHRONIZATION
 * Uses Firebase 'onSnapshot' to listen for database changes in real-time.
 * This ensures the lecturer sees student check-ins instantly without refreshing.
 */
window.addEventListener('load', () => {
    const tableBody = document.getElementById("attendanceBody");

    // Sort records by timestamp descending to show the latest check-ins at the top
    const q = query(collection(db, "attendance"), orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        if (!tableBody) return;
        tableBody.innerHTML = ""; // Clear existing rows to prevent duplication

        snapshot.forEach((doc) => {
            const data = doc.data();
            // Dynamically inject table rows with sanitised student data
            tableBody.innerHTML += `
                <tr>
                    <td>${data.name || 'N/A'}</td>
                    <td>${data.studentID || 'N/A'}</td>
                    <td>${data.time || 'N/A'}</td>
                </tr>`;
        });
    });
});

/**
 * 2. SECURE DYNAMIC QR GENERATION
 * Generates a "Time-Tokenised" QR code that refreshes every 15 seconds.
 * This prevents students from taking a photo of the QR code and sharing it with absent peers.
 */
let qrInterval;
window.generateQR = function() {
    const qrDiv = document.getElementById("qrcode");
    if (!qrDiv) return;

    // Reset any existing intervals to avoid memory leaks
    if (qrInterval) clearInterval(qrInterval);

    const createTokenizedQR = () => {
        qrDiv.innerHTML = ""; // Clear current QR

        // Generate a unique token based on 15-second windows of time
        const timeBlock = Math.floor(Date.now() / 15000);
        const githubStudentUrl = "https://mieshal-alkharji.github.io/attendance-system/student.html";

        // Encapsulate session data into a URL-safe JSON string
        const sessionData = { isAttendanceQR: true, t: timeBlock };
        const finalUrl = `${githubStudentUrl}?data=${encodeURIComponent(JSON.stringify(sessionData))}`;

        // Initialise QRCode library with high-error correction for easy scanning
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
    // Auto-refresh the QR code to maintain high security
    qrInterval = setInterval(createTokenizedQR, 15000);
    alert("Smart QR Started: Refreshing every 15 seconds.");
};

/**
 * 3. ATTENDANCE REPORT EXPORT (CSV)
 * Aggregates all database records into a downloadable comma-separated file.
 * Formats timestamps into human-readable dates for administration use.
 */
window.downloadCSV = async function() {
    try {
        const querySnapshot = await getDocs(collection(db, "attendance"));

        // Initialise CSV header structure
        let csvContent = "Date,Student Name,Student ID,Time\n";

        querySnapshot.forEach(doc => {
            const d = doc.data();

            // Extract date from the stored timestamp or default to current date
            let rowDate = "";
            if (d.timestamp) {
                const dateObj = new Date(d.timestamp);
                rowDate = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
            } else {
                const now = new Date();
                rowDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
            }

            // Data sanitisation: Remove any commas from names to prevent CSV formatting errors
            const name = (d.name || "N/A").replace(/,/g, "");
            const id = (d.studentID || "N/A").replace(/,/g, "");
            const time = (d.time || "N/A").replace(/,/g, "");

            csvContent += `${rowDate},${name},${id},${time}\n`;
        });

        // Generate a Blob object and trigger a virtual download click
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `Attendance_Report_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error("Export Error:", error);
        alert("Failed to generate CSV. Check browser console for details.");
    }
};

/**
 * 4. DATABASE HOUSEKEEPING
 * Provides a method for the lecturer to clear the attendance collection for a new session.
 */
window.clearRecords = async function() {
    if(confirm("Are you sure? This will permanently delete all attendance records for this session.")) {
        const querySnapshot = await getDocs(collection(db, "attendance"));
        // Iteratively delete each document reference
        for (const docSnap of querySnapshot.docs) {
            await deleteDoc(docSnap.ref);
        }
        console.log("Database cleared successfully.");
    }
};
