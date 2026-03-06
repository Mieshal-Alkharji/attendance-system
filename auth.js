const users = [
    { id: "0001", name: "Mieshal Alkharji", role: "student" },
    { id: "0002", name: "Mohammed Ali", role: "student" },
    { id: "0003", name: "Ali Khalid", role: "student" },
    { id: "admin", name: "Dr. Smith", role: "lecturer" }
];

function attemptLogin() {
    const nameInput = document.getElementById("loginName").value.trim();
    const idInput = document.getElementById("loginID").value.trim();
    const errorMsg = document.getElementById("error-msg");

    // Find a user that matches BOTH Name and ID
    const user = users.find(u => u.name === nameInput && u.id === idInput);

    if (user) {
        // Save user info so other pages know who is logged in
        localStorage.setItem("currentUser", JSON.stringify(user));

        // Role-Based Redirection
        if (user.role === "lecturer") {
            window.location.href = "lecturer.html";
        } else {
            window.location.href = "student.html";
        }
    } else {
        errorMsg.innerText = "Invalid Name or ID. Please try again.";
    }
}
