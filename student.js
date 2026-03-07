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

const html5QrCode = new Html5Qrcode("reader");
let sessionInfo = null;

// Start the Scanner automatically on load
html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
        try {
            sessionInfo = JSON.parse(decodedText);

            // Stop camera and switch to Form
            html5QrCode.stop().then(() => {
                document.getElementById("scanner-section").style.display = "none";
                document.getElementById("form-section").style.display = "block";

                // Show the course name if available
                if(sessionInfo.course) {
                    document.getElementById("courseNameDisplay").innerText = "Attendance for: " + sessionInfo.course;
                }
            });
        } catch (e) {
            alert("Error: Please scan the official Lecturer QR Code.");
        }
    }
).catch(err => console.error("Scanner error:", err));

// Global function for the Submit button
window.submitAttendance = async function() {
    const name = document.getElementById("inputName").value.trim();
    const id = document.getElementById("inputID").value.trim();

    if (!name || !id) {
        alert("Please fill in both fields.");
        return;
    }

    try {
        await addDoc(collection(db, "attendance"), {
            name: name,
            studentID: id,
            course: sessionInfo ? sessionInfo.course : "General Class",
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        });

        alert("Success! Your attendance has been recorded.");
        window.location.reload(); // Returns to scanner for next student
    } catch (e) {
        console.error("Submission error:", e);
        alert("Submission failed. Check your internet connection.");
    }
};
