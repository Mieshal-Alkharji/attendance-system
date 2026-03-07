import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// On Load: Check the URL for data from the QR scan
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');

    if (dataParam) {
        try {
            sessionInfo = JSON.parse(decodeURIComponent(dataParam));

            // Switch UI: Hide scanner message, show the input form
            const scannerSection = document.getElementById("scanner-section");
            const formSection = document.getElementById("form-section");

            if (scannerSection) scannerSection.style.display = "none";
            if (formSection) formSection.style.display = "block";

            // Note: We are no longer displaying the Course Name here
        } catch (e) {
            console.error("URL Data Error", e);
        }
    }
});

// Submit Attendance Logic
window.submitAttendance = async function() {
    const nameField = document.getElementById("inputName");
    const idField = document.getElementById("inputID");

    const name = nameField ? nameField.value.trim() : "";
    const id = idField ? idField.value.trim() : "";

    if (!name || !id) {
        return alert("Please enter both your Name and Student ID");
    }

    try {
        // Only saving Name, ID, and Time as requested
        await addDoc(collection(db, "attendance"), {
            name: name,
            studentID: id,
            time: new Date().toLocaleTimeString(), // Professional time format
            timestamp: Date.now() // Used for sorting the dashboard
        });

        alert("Attendance recorded successfully!");

        // Redirect back to clean student page to prevent duplicate submissions
        window.location.href = "student.html";
    } catch (e) {
        console.error("Submission Error:", e);
        alert("Error saving attendance: " + e.message);
    }
};
