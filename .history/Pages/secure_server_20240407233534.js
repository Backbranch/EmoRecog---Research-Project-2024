const express = require("express");
const https = require("https");
const fs = require("fs");
const app = express();

// Standard HTTPS port
const port = 3000;

// SSL certificate options
const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/emotirec.com/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/emotirec.com/cert.pem"),
  ca: fs.readFileSync("/etc/letsencrypt/live/emotirec.com/chain.pem")
};

// Serve static files from the "public" directory
app.use(express.static("./"));

// Create HTTPS server
https.createServer(options, app).listen(port, '172.31.21.182', () => {
  console.log(`Server running at https://172.31.21.182:${port}`);
});