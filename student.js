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

    // Clean user input
    const inputName = nameField.value.trim().toLowerCase();
    const inputID = idField.value.trim();

    if (!inputName || !inputID) {
        return alert("Please enter both Name and ID");
    }

    try {
        const studentsRef = collection(db, "Auto-ID");
        const querySnapshot = await getDocs(studentsRef);

        let matched = false;

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // SUPER CLEAN: Convert everything to a string, trim it, and lowercase it
            const dbName = String(data.name || "").replace(/\s+/g, ' ').trim().toLowerCase();
            const dbID = String(data.studentID || "").trim();

            // Debugging console (Check your browser inspect tool if this fails)
            console.log(`Checking: DB Name [${dbName}] against Input [${inputName}]`);

            if (dbName === inputName && dbID === inputID) {
                matched = true;
            }
        });

        if (!matched) {
            return alert("❌ Still not found. Please re-check the spelling in Firebase.");
        }

        await addDoc(collection(db, "attendance"), {
            name: nameField.value.trim(),
            studentID: inputID,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        });

        alert("✅ Success! Attendance recorded.");
        window.location.href = "student.html";

    } catch (e) {
        alert("Error: " + e.message);
    }
};
