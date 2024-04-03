const express = require('express');
const browserSync = require('browser-sync');
const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static('WEBFACE'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Initialize BrowserSync
browserSync.init({
    proxy: `localhost:${port}`,
    files: ['WEBFACE/**/*.*'],
    open: false
});