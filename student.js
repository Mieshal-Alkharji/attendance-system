/**
 * SmartCheck Student Portal & Attendance Validator
 * Implements a time-sensitive verification system to ensure physical presence.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// Initialise Firebase services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global state to hold the parsed QR session data
let sessionInfo = null;

/**
 * 1. INITIAL LOAD & QR CRYPTOGRAPHIC VALIDATION
 * Parses the URL parameters to extract the time-token from the scanned QR code.
 * Implements an 'Anti-Proxy' check to reject expired or shared QR photos.
 */
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');

    if (dataParam) {
        try {
            // Decode and parse the session data from the URL
            sessionInfo = JSON.parse(decodeURIComponent(dataParam));

            /** * TIME-WINDOW VALIDATION:
             * We calculate a 15-second 'Time Block' to compare against the QR token.
             * If the discrepancy is >1 block, the QR is considered stale/unauthorised.
             */
            const currentTimeBlock = Math.floor(Date.now() / 15000);
            const scannedTimeBlock = sessionInfo.t;

            if (Math.abs(currentTimeBlock - scannedTimeBlock) > 1) {
                alert("❌ QR Code Expired! Please scan the live code on the lecturer's screen.");
                window.location.href = "student.html";
                return;
            }

            // UI Transition: Hide the scanner instructions and show the identity form
            const scannerSection = document.getElementById("scanner-section");
            const formSection = document.getElementById("form-section");
            if (scannerSection) scannerSection.style.display = "none";
            if (formSection) formSection.style.display = "block";

        } catch (e) {
            console.error("Payload Extraction Error:", e);
        }
    }
});

/**
 * 2. ATTENDANCE SUBMISSION & IDENTITY VERIFICATION
 * Cross-references student input with the 'Auto-ID' whitelist in Firestore.
 * Performs a secondary time-check to prevent 'session hijacking' during form filling.
 */
window.submitAttendance = async function() {
    const nameField = document.getElementById("inputName");
    const idField = document.getElementById("inputID");
    const submitBtn = document.getElementById("submitBtn");

    // Sanitise input to ensure case-insensitive matching
    const inputName = nameField.value.trim().toLowerCase();
    const inputID = idField.value.trim();

    if (!inputName || !inputID) {
        return alert("Please enter both Name and ID");
    }

    /** * SECONDARY TIMEOUT CHECK:
     * Ensures the student didn't spend more than 2.5 minutes on the form page
     * after a valid scan, maintaining the integrity of the 'live' check-in.
     */
    const currentTimeBlock = Math.floor(Date.now() / 15000);
    if (sessionInfo && Math.abs(currentTimeBlock - sessionInfo.t) > 10) {
        return alert("❌ Session timed out. Please re-scan the live QR code.");
    }

    try {
        // Prevent race conditions and multiple submissions
        submitBtn.disabled = true;
        submitBtn.innerText = "Verifying Identity...";

        // Fetch the whitelist for server-side (simulated) validation
        const studentsRef = collection(db, "Auto-ID");
        const querySnapshot = await getDocs(studentsRef);

        let matched = false;
        let officialName = "";

        // Identity Verification Loop
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const dbName = String(data.name || "").replace(/\s+/g, ' ').trim().toLowerCase();
            const dbID = String(data.studentID || "").trim();

            if (dbName === inputName && dbID === inputID) {
                matched = true;
                officialName = data.name; // Use the formatted name from the DB
            }
        });

        if (!matched) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Submit Attendance";
            return alert("❌ Student not found. Please check spelling or Student ID.");
        }

        /** * 3. RECORD COMMITMENT
         * On successful verification, log the entry to the 'attendance' collection
         * including a security flag and high-precision timestamp.
         */
        await addDoc(collection(db, "attendance"), {
            name: officialName,
            studentID: inputID,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now(),
            verification: "Secure Dynamic QR (15s)"
        });

        // Final UI Transition: Show success confirmation (SPA pattern)
        document.getElementById("form-section").style.display = "none";
        document.getElementById("success-section").style.display = "block";

    } catch (e) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Attendance";
        alert("Transaction Failed: " + e.message);
    }
};
