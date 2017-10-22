const jwt = require('jsonwebtoken');
const {Todo} = require("./../../models/todo");
const {User} = require("./../../models/user");

const {ObjectID} = require("mongodb");

const todos = [{
    text: "First todo",
    _id: new ObjectID()
}, {
    text: "Second todo",
    _id: new ObjectID()
}];

const populateTodos = (done) => {
    Todo.remove({})
        .then(() => {
            return Todo.insertMany(todos);
        }).then(() => done());
}

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
    _id: userOneId,
    email: 'abc@xyz.com',
    password: 'abcPassword',
    tokens: [
        {
            access:'auth',
            token: jwt.sign({_id: userOneId.toHexString(), access: 'auth'}, "secretKey").toString()
        }
    ]
}, {
    _id: userTwoId,
    email: 'def@xyz.com',
    password: 'defPassword'
}];

const populateUsers = (done) => {
    User.remove({})
    .then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();
        return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
}

module.exports = {
    todos, populateTodos,
    users, populateUsers
}