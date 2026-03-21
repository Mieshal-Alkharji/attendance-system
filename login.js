/**
 * Firebase Authentication & Role-Based Access Control (RBAC)
 * Developed for the SmartCheck Attendance System.
 * This module handles secure user verification via Firestore.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

/**
 * Main login handler.
 * Validates user credentials against the 'Auto-ID' collection in Firestore.
 */
window.attemptLogin = async function() {
    // Capture user input and remove leading/trailing whitespace
    const nameInput = document.getElementById("loginName").value.trim();
    const idInput = document.getElementById("loginID").value.trim();
    const errorMsg = document.getElementById("error-msg");
    const loginBtn = document.querySelector("button");

    // Simple front-end validation to prevent empty queries
    if (!nameInput || !idInput) {
        errorMsg.innerText = "Please enter both Name and ID.";
        return;
    }

    // Visual feedback for the user during the asynchronous database fetch
    loginBtn.innerText = "Verifying...";
    loginBtn.disabled = true;

    try {
        // Construct a Firestore query to find a matching user document
        // We check 'name' and 'studentID' (used for both lecturers and students)
        const q = query(
            collection(db, "Auto-ID"),
            where("name", "==", nameInput),
            where("studentID", "==", idInput)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // User found! Extract document data
            const userData = querySnapshot.docs[0].data();

            /** * Persistence: Save user details in LocalStorage.
             * This allows other pages (lecturer.html/student.html) to personalise
             * the experience without re-fetching from the database.
             */
            localStorage.setItem("currentUser", JSON.stringify(userData));

            /** * Data Normalization:
             * We sanitise the 'role' string by converting it to lowercase and removing
             * any hidden spaces. This prevents login failures due to database entry typos.
             */
            const rawRole = userData.role || userData.Role || "student";
            const cleanRole = rawRole.toString().toLowerCase().replace(/\s/g, '');

            // Role-Based Redirection: Send users to their respective dashboards
            if (cleanRole === "lecturer") {
                console.log("Authentication successful: Accessing Lecturer Dashboard.");
                window.location.href = "lecturer.html";
            } else {
                console.log("Authentication successful: Accessing Student Portal.");
                window.location.href = "student.html";
            }
        } else {
            // Failure: No matching document found in the Auto-ID collection
            errorMsg.innerText = "Invalid Name or ID. Access Denied.";
            loginBtn.innerText = "Login";
            loginBtn.disabled = false;
        }

    } catch (error) {
        // Exception handling for network errors or Firebase configuration issues
        console.error("Critical Login Error:", error);
        errorMsg.innerText = "Connection error. Please try again later.";
        loginBtn.innerText = "Login";
        loginBtn.disabled = false;
    }
};
