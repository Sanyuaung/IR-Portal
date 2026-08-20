const fs = require('fs');
let code = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');
if (!code.includes("authMode === 'forgot'")) {
    console.log("Adding forgot authMode");
} else {
    console.log("Forgot authMode already added");
}
