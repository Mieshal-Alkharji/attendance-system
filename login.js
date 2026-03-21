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
        const q = query(
            collection(db, "Auto-ID"),
            where("name", "==", nameInput),
            where("studentID", "==", idInput)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            
            // This alert will tell us exactly what is wrong
            const foundRole = userData.role || "NOT FOUND";
            alert("Firebase says the role is: " + foundRole);

            localStorage.setItem("currentUser", JSON.stringify(userData));

            // Normalize and Check
            const cleanRole = foundRole.toString().trim().toLowerCase();

            if (cleanRole === "lecturer") {
                window.location.href = "lecturer.html";
            } else {
                window.location.href = "student.html";
            }
        } else {
            errorMsg.innerText = "Invalid Name or ID.";
            loginBtn.innerText = "Login";
            loginBtn.disabled = false;
        }

    } catch (error) {
        alert("System Error: " + error.message);
        loginBtn.innerText = "Login";
        loginBtn.disabled = false;
    }
};
