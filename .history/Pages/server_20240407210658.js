const express = require("express");
const app = express();
const port = 80;

// Get IP address from command line arguments
const ipAddress = process.argv[2] || "localhost";

// Serve static files from the "public" directory
app.use(express.static("./"));

app.listen(port, ipAddress, () => {
  console.log(`Server running at http://${ipAddress}:${port}`);
});
