const express = require("express");
const https = require("https");
const fs = require("fs");
const app = express();
const port = 443;

// SSL certificate options
const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/emotirec.com/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/emotirec.com/cert.pem"),
  ca: fs.readFileSync("/etc/letsencrypt/live/emotirec.com/chain.pem")
};

// Serve static files from the "public" directory
app.use(express.static("./"));

// Create HTTPS server
https.createServer(options, app).listen(port, () => {
  console.log(`Server running at https://emotirec.com:${port}`);
});