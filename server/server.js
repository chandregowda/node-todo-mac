/**
 * Main server file to start our todo server
 */

require('./config/config'); // Set the environment variables

const express = require("express");
const bodyParser = require("body-parser");
const hbs = require("hbs");
const {ObjectID} = require('mongodb');
const _ = require("lodash");
const {mongoose} = require('./utils/mongoose-config');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require("./middleware/authenticate");

const PORT = process.env.PORT || 3000;

var app = express();
app.use(bodyParser.json());
app.set("view engine", 'hbs');

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token)=>{
        res.header({'x-auth':token}).send(user);
    }).catch((err) => {
        res.status(404).send(err);
    });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send({user});
});

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

app.patch("/todos/:id", (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if(body.completed && _.isBoolean(body.completed)) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    // new: true to get the updated result
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo)=>{
        if(!todo) {
            return res.status(404).send();
        }
        return res.send(todo);
    }).catch( (e) => {
        res.status(404).send(e);
    });

});

app.get("/", (req, res) => {
    res.render("index.hbs", {pageTitle: "My ToDo App"});
})

// if(!module.parent) {
    app.listen(PORT, (err) => {
        if (err) {
            console.log("Failed to start server", err);
        } else {
            console.log("Server started successfully at PORT : ", PORT);
        }
    });
// }

module.exports = {app};