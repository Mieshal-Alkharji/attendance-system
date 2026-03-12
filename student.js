import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// 1. ORIGINAL LOGIC: Handle the QR Scan URL on Page Load
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');

    if (dataParam) {
        try {
            sessionInfo = JSON.parse(decodeURIComponent(dataParam));

            const scannerSection = document.getElementById("scanner-section");
            const formSection = document.getElementById("form-section");

            if (scannerSection) scannerSection.style.display = "none";
            if (formSection) formSection.style.display = "block";
        } catch (e) {
            console.error("URL Data Error", e);
        }
    }
});

// 2. UPDATED LOGIC: Submit Attendance with Database Check
window.submitAttendance = async function() {
    // .trim() removes any accidental spaces at the start or end
    const inputName = document.getElementById("inputName").value.trim();
    const inputID = document.getElementById("inputID").value.trim();

    if (!inputName || !inputID) {
        return alert("Please enter both your Name and Student ID");
    }

    try {
        const studentsRef = collection(db, "Auto-ID");

        // We search exactly for what is in the database
        const q = query(studentsRef,
            where("name", "==", inputName),
            where("studentID", "==", inputID)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // This triggers if capitalization or spacing is wrong
            return alert("❌ Student not found. Check that you used CAPITAL letters correctly and no extra spaces.");
        }

        await addDoc(collection(db, "attendance"), {
            name: inputName,
            studentID: inputID,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        });

        alert("✅ Success! Attendance recorded.");
        window.location.href = "student.html";
    } catch (e) {
        alert("System error: " + e.message);
    }
};
