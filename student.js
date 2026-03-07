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

// On Load: Check the URL for data
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');

    if (dataParam) {
        try {
            sessionInfo = JSON.parse(decodeURIComponent(dataParam));

            // Show the form, hide the "Scan" message
            document.getElementById("scanner-section").style.display = "none";
            document.getElementById("form-section").style.display = "block";
            document.getElementById("courseDisplay").innerText = "Class: " + sessionInfo.course;
        } catch (e) {
            console.error("URL Data Error", e);
        }
    }
});

window.submitAttendance = async function() {
    const name = document.getElementById("inputName").value.trim();
    const id = document.getElementById("inputID").value.trim();

    if (!name || !id) return alert("Please enter Name and ID");

    try {
        await addDoc(collection(db, "attendance"), {
            name: name,
            studentID: id,
            course: sessionInfo ? sessionInfo.course : "General",
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        });
        alert("Attendance recorded!");
        // Clear the URL and reset
        window.location.href = "student.html";
    } catch (e) {
        alert("Error: " + e.message);
    }
};
