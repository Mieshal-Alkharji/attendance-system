import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your actual Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBTwzS4-UbmvDKLeI4Kyv_tWvvOTVTF-ug",
    authDomain: "attendancesystem-16e5c.firebaseapp.com",
    projectId: "attendancesystem-16e5c",
    storageBucket: "attendancesystem-16e5c.firebasestorage.app",
    messagingSenderId: "33422610799",
    appId: "1:33422610799:web:ba428fb6b648de9942189a",
    measurementId: "G-8VBJE6LDTY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const html5QrCode = new Html5Qrcode("reader");
let sessionInfo = null;

// QR Scanner Logic
html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, (text) => {
    try {
        sessionInfo = JSON.parse(text);
        document.getElementById("scanner-section").style.display = "none";
        document.getElementById("form-section").style.display = "block";
        html5QrCode.stop();
    } catch (e) {
        alert("Invalid QR Code Format");
    }
});

// The Cloud Submission Function
window.submitAttendance = async function() {
    const name = document.getElementById("inputName").value;
    const id = document.getElementById("inputID").value;

    if (!name || !id) {
        alert("Please enter both Name and ID");
        return;
    }

    try {
        // Pushes to Firebase 'attendance' collection
        await addDoc(collection(db, "attendance"), {
            name: name,
            studentID: id,
            course: sessionInfo ? sessionInfo.course : "General Class",
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            timestamp: Date.now()
        });

        alert("Success! Your attendance is now visible to the lecturer.");
        window.location.reload();
    } catch (e) {
        console.error("Firebase Error: ", e);
        alert("Submission failed. Check your Firebase Rules!");
    }
};
