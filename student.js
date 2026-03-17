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

// 1. Initial Load and QR Validation
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    if (dataParam) {
        try {
            sessionInfo = JSON.parse(decodeURIComponent(dataParam));

            // --- TIME VALIDATION (Anti-Proxy Check) ---
            const currentTimeBlock = Math.floor(Date.now() / 15000); // 15-second block
            const scannedTimeBlock = sessionInfo.t;

            // Block access if the QR is older than 15-30 seconds
            if (Math.abs(currentTimeBlock - scannedTimeBlock) > 1) {
                alert("❌ QR Code Expired! Please scan the live code on the lecturer's screen.");
                window.location.href = "student.html";
                return;
            }

            const scannerSection = document.getElementById("scanner-section");
            const formSection = document.getElementById("form-section");
            if (scannerSection) scannerSection.style.display = "none";
            if (formSection) formSection.style.display = "block";
        } catch (e) { console.error("URL Data Error", e); }
    }
});

// 2. Attendance Submission Logic
window.submitAttendance = async function() {
    const nameField = document.getElementById("inputName");
    const idField = document.getElementById("inputID");
    const submitBtn = document.getElementById("submitBtn");

    const inputName = nameField.value.trim().toLowerCase();
    const inputID = idField.value.trim();

    if (!inputName || !inputID) {
        return alert("Please enter both Name and ID");
    }

    // --- RE-CHECK TIME (Ensure they didn't wait too long to type) ---
    const currentTimeBlock = Math.floor(Date.now() / 15000);
    if (sessionInfo && Math.abs(currentTimeBlock - sessionInfo.t) > 10) {
        return alert("❌ Session timed out. Please re-scan the live QR code.");
    }

    try {
        // Disable button to prevent double-clicks
        submitBtn.disabled = true;
        submitBtn.innerText = "Verifying...";

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
            submitBtn.disabled = false;
            submitBtn.innerText = "Submit Attendance";
            return alert("❌ Student not found. Please check spelling or Student ID.");
        }

        // --- SAVE TO FIREBASE ---
        await addDoc(collection(db, "attendance"), {
            name: officialName,
            studentID: inputID,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now(),
            verification: "Secure QR (15s)"
        });

        // --- SUCCESS UI TRANSITION (SPA Style) ---
        document.getElementById("form-section").style.display = "none";
        document.getElementById("success-section").style.display = "block";

    } catch (e) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Attendance";
        alert("Error: " + e.message);
    }
};
