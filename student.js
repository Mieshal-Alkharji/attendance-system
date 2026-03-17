import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

let sessionInfo = null;

window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    if (dataParam) {
        try {
            sessionInfo = JSON.parse(decodeURIComponent(dataParam));

            // --- NEW: TIME VALIDATION ---
            const currentTimeBlock = Math.floor(Date.now() / 15000);
            const scannedTimeBlock = sessionInfo.t;

            // Allow a 1-block grace period (15 seconds) for network lag
            if (Math.abs(currentTimeBlock - scannedTimeBlock) > 1) {
                alert("❌ QR Code Expired! Please scan the new code on the lecturer's screen.");
                window.location.href = "student.html"; // Redirect back to scanner
                return;
            }

            const scannerSection = document.getElementById("scanner-section");
            const formSection = document.getElementById("form-section");
            if (scannerSection) scannerSection.style.display = "none";
            if (formSection) formSection.style.display = "block";
        } catch (e) { console.error("URL Data Error", e); }
    }
});

window.submitAttendance = async function() {
    const nameField = document.getElementById("inputName");
    const idField = document.getElementById("inputID");

    const inputName = nameField.value.trim().toLowerCase();
    const inputID = idField.value.trim();

    if (!inputName || !inputID) {
        return alert("Please enter both Name and ID");
    }

    // --- RE-CHECK TIME ON SUBMISSION (Double Security) ---
    const currentTimeBlock = Math.floor(Date.now() / 15000);
    if (sessionInfo && Math.abs(currentTimeBlock - sessionInfo.t) > 5) { // 5 blocks = 75 seconds max window
        return alert("❌ Session timed out. Please re-scan the live QR code.");
    }

    try {
        const studentsRef = collection(db, "Auto-ID");
        const querySnapshot = await getDocs(studentsRef);

        let matched = false;
        let officialName = "";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const dbName = String(data.name || "").replace(/\s+/g, ' ').trim().toLowerCase();
            const dbID = String(data.studentID || "").trim();

            if (dbName === inputName && dbID === inputID) {
                matched = true;
                officialName = data.name;
            }
        });

        if (!matched) {
            return alert("❌ Student not found. Please re-check the spelling or ID.");
        }

        await addDoc(collection(db, "attendance"), {
            name: officialName,
            studentID: inputID,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now(),
            verification: "Secure QR" // Note for the lecturer
        });

        alert("✅ Success! Attendance recorded.");
        window.location.href = "student.html";

    } catch (e) {
        alert("Error: " + e.message);
    }
};
