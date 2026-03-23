# SmartCheck Attendance System

SmartCheck is a real time, serverless attendance tracking system using QR code verification and Firebase Firestore.

##  Folder Structure
This project is organised as a flat structure web application:
* index.html / login.js — The entry point of the application handling authentication.
* lecturer.html / lecturer.js — Dashboard for session control and live monitoring.
* student.html / student.js — Mobile ready portal for QR scanning and check-in.
* style.css — Global stylesheet for all portal pages.
* package.json — Project metadata.
* README.md — This documentation file.

##  Hosted URL (Live Demo)
The product is hosted on GitHub Pages for easy access:

https://mieshal-alkharji.github.io/attendance-system/

##  Installation & Testing Instructions
Because this project uses JavaScript Modules, it requires a local server environment to run.

### Option A: Local Server (VS Code)
1. Open the project folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click index.html and select **Open with Live Server**.

### Option B: Terminal (Python)
1. Open your terminal in the project folder.
2. Run the command: python -m http.server 8000
3. Visit http://localhost:8000 in your browser.

## Test Credentials
Use the following identities to test the Role Based Access:

| Role | Name             | ID    |
| :--- |:-----------------|:------|
| **Lecturer** | Dr. smith        | admin |
| **Student** | Mieshal Alkharji | 0001  |
| **Student** | Mohammed Ali     | 0002  |
| **Student** | Ali Khalid       | 0003  |

## Features
* **Anti-Proxy Security:** QR codes rotate every 15 seconds.
* **Live Updates:** Lecturer dashboard updates instantly via Firestore Snapshots.
* **Data Export:** Lecturers can download attendance logs as a CSV file.