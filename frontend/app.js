const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const html = fs.readFileSync("frontend/index.html");

const app = express();
const port = process.env.PORT || 3000;

const log = function (entry) {
  fs.appendFileSync(
    "/tmp/sample-app.log",
    new Date().toISOString() + " - " + entry + "\n"
  );
};

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Endpoint for serving HTML content
app.get("/", (req, res) => {
  res.writeHead(200);
  res.write(html);
  res.end();
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});
