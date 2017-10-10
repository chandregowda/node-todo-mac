/**
 * Main server file to start our todo server
 */

const express = require("express");
const bodyParser = require("body-parser");
const hbs = require("hbs");
const {ObjectID} = require('mongodb');
const {mongoose} = require('./utils/mongoose-config');
const {Todo} = require('./models/todo');

const PORT = process.env.PORT || 3000;

var app = express();
app.use(bodyParser.json());
app.set("view engine", 'hbs');

app.post('/todos', (req, res) => {
    // console.log("Post request", JSON.stringify(req.body, undefined, 2));
    // res.json({error:null, response:{message:'success'}});
    var todo = new Todo({
        text: req.body.text
    });
    todo.save().then((doc)=>{
        res.send(doc)
    }, (err) => {
        res.status(400).send(err);
    })
});

app.get("/todos", (req, res) => {
    // res.send("Welcome to my ToDo Page");
    Todo.find().then((todos) => {
        res.send({todos});
    }, (err) => {
        res.send(e);
    });
});

app.get("/todos/:id", (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send({message: 'Invalid ID'});
    }
    Todo.findById(id).then((todo) => {
        if (!todo) {
            res.status(404).send({});
        } else {
            res.send({todo});
        }
    }).catch( (e) => {
        res.status(404).send(e);
    })
});

app.delete("/todos/:id", (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)) {
        return res.status(404).send({error: "Invalid ID to delete"});
    }
    Todo.findByIdAndRemove(id).then((todo) => {
        if(!todo) {
            return res.status(404).send({});
        }
        res.send({todo});
    }).catch((e) => {
        res.status(404).send(e);
    });
});

app.get("/", (req, res) => {
    res.render("index.hbs", {pageTitle: "My ToDo App"});
})

app.listen(PORT, (err) => {
    if (err) {
        console.log("Failed to start server", err);
    } else {
        console.log("Server started successfully at PORT : ", PORT);
    }
});

module.exports = {app};