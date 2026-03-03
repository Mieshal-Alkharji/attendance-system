const html5QrCode = new Html5Qrcode("reader");
let sessionInfo = null;

html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, (text) => {
    sessionInfo = JSON.parse(text);
    if (Date.now() > sessionInfo.expires) return alert("Expired!");
    document.getElementById("scanner-section").style.display = "none";
    document.getElementById("form-section").style.display = "block";
    html5QrCode.stop();
});

function submitAttendance() {
    const name = document.getElementById("inputName").value;
    const id = document.getElementById("inputID").value;
    const record = { name, id, time: new Date().toLocaleTimeString() };

    let db = JSON.parse(localStorage.getItem("attendanceDB")) || [];
    db.push(record);
    localStorage.setItem("attendanceDB", JSON.stringify(db));

    alert("Success! Form submitted.");
    window.location.reload();
}
// Check if the page was opened via a QR link
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const qrDataRaw = urlParams.get('data');

    if (qrDataRaw) {
        try {
            const sessionInfo = JSON.parse(decodeURIComponent(qrDataRaw));

            // Check if expired
            if (Date.now() > sessionInfo.expires) {
                alert("This session has expired. Please scan a new code.");
                return;
            }

            // Successfully opened! Hide scanner and show form
            document.getElementById("scanner-section").style.display = "none";
            document.getElementById("form-section").style.display = "block";

            console.log("Joined course:", sessionInfo.course);
        } catch (e) {
            console.error("Invalid QR Link Data");
        }
    }
};

// ... keep your existing submitAttendance() function here ...