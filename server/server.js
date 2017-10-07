/**
 * Main server file to start our todo server
 */

const express = require("express");
const PORT = process.env.PORT || 3000;
var app = express();


app.get("/", (req, res) => {
    res.send("Welcome to my ToDo Page");
});

app.listen(PORT, (err) => {
    if (err) {
        console.log("Failed to start server", err);
    } else {
        console.log("Server started successfully at PORT : ", PORT);
    }
});
