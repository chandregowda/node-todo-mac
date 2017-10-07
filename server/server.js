/**
 * Main server file to start our todo server
 */

const express = require("express");
const hbs = require("hbs");

const PORT = process.env.PORT || 3000;

var app = express();
app.set("view engine", 'hbs');

app.get("/", (req, res) => {
    // res.send("Welcome to my ToDo Page");
    res.render("index.hbs", {pageTitle: "My ToDo App"});
});

app.listen(PORT, (err) => {
    if (err) {
        console.log("Failed to start server", err);
    } else {
        console.log("Server started successfully at PORT : ", PORT);
    }
});
