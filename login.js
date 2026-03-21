import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

window.attemptLogin = async function() {
    const nameInput = document.getElementById("loginName").value.trim();
    const idInput = document.getElementById("loginID").value.trim();
    const errorMsg = document.getElementById("error-msg");
    const loginBtn = document.querySelector("button");

    if (!nameInput || !idInput) {
        errorMsg.innerText = "Please enter both Name and ID.";
        return;
    }

    loginBtn.innerText = "Verifying...";
    loginBtn.disabled = true;

    try {
        // 1. Search Firebase for the user
        // Note: Field name 'studentID' must match your Firebase exactly
        const q = query(
            collection(db, "Auto-ID"),
            where("name", "==", nameInput),
            where("studentID", "==", idInput)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            
            // Save to localStorage so student.js can use it later
            localStorage.setItem("currentUser", JSON.stringify(userData));

            // 2. CLEAN THE ROLE: Convert to lowercase and remove spaces
            // This prevents errors if Firebase has "Lecturer" or "lecturer "
            const userRole = (userData.role || "student").toString().trim().toLowerCase();

            console.log("Login successful. Role detected:", userRole);

            // 3. REDIRECT
            if (userRole === "lecturer") {
                window.location.href = "lecturer.html";
            } else {
                window.location.href = "student.html";
            }
        } else {
            errorMsg.innerText = "Invalid Name or ID. Access Denied.";
            loginBtn.innerText = "Login";
            loginBtn.disabled = false;
        }

    } catch (error) {
        console.error("Login Error:", error);
        errorMsg.innerText = "Connection error. Check console.";
        loginBtn.innerText = "Login";
        loginBtn.disabled = false;
    }
};
