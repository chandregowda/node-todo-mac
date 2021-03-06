const {
    app
} = require("./../server");
const {
    Todo
} = require("./../models/todo");
const {
    User
} = require("./../models/user");
const expect = require("expect");
const request = require("supertest");
// const request = require("supertest").agent(app.listen());
const {
    ObjectID
} = require("mongodb");

const {
    todos,
    populateTodos,
    users,
    populateUsers
} = require("./seed/seed");
// beforeEach(populateTodos);

// beforeEach((done)=> {populateTodos()});
beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
    it("should create new document", (done) => {
        var text = "Test data for todo";
        request(app)
            .post('/todos')
            .send({
                text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({
                    text
                }).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => {
                    done(e);
                });
            });
    }); // First test case

    // Second test case
    it('should not create any document with wrong data', (done) => {
        request(app)
            .post('/todos')
            .send({}) // pass on empty object
            .expect(400) // Assert for 400 status
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    }); // Second test case


});

describe('GET /todos', () => {
    it('should get 2 record', (done) => {
        request(app)
            .get("/todos")
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    }); // should get one record

    it('should get one record from todo list', (done) => {
        var id = todos[0]._id.toHexString();
        request(app)
            .get(`/todos/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    }); // should get one record from todo list

    it('should return 404 as the requested id does not exists', (done) => {
        var id = new ObjectID();
        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .end(done);
    }); // 404 for non existant id

    it('should return 404 for invalid ID', (done) => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done);
    }); // 404 for invalid ID
});

describe('DELETE /todos/:id', () => {
    it("should return 404 for invalid ID", (done) => {
        request(app)
            .delete('/todos/123')
            .expect(404)
            .end(done);
    }); // 404 for Invalid ID

    it('should return 404 for non existant ID', (done) => {
        var id = new ObjectID();
        request(app)
            .delete('/todos/' + id)
            .expect(404)
            .end(done);
    }); // 404 for non existant ID

    it('should return deleted object', (done) => {
        var id = todos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    }); // Delete one record
});

describe("POST /users", () => {
    it('should not add user with blank email', (done) => {
        request(app)
            .post('/users/')
            .send({
                email: '',
                password: "something"
            })
            .expect(404)
            .end(done);
    });

    it('should not add user with blank password', (done) => {
        request(app)
            .post('/users/')
            .send({
                email: 'valid@abc.com',
                password: ""
            })
            .expect(404)
            .end(done);
    });

    it('should not add user if password length is < 6', (done) => {
        request(app)
            .post('/users')
            .send({
                email: 'aaa@bbb.com',
                password: '5char'
            })
            .expect(404)
            .end(done);
    });

    it('should not add duplicate email', (done) => {
        var email = users[0].email,
            password = 'newPassword';

        request(app)
            .post('/users')
            .send({
                email,
                password
            })
            .expect(404)
            .end(done);
    });
    it('should add new User detail', (done) => {
        const email = 'test@abc.com';
        const password = 'testPassword';
        request(app)
            .post('/users')
            .send({email,password})
            .expect(200)
            .expect((res) => {
                expect(res.body.email).toBe('test@abc.com');
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body['_id']).toBeTruthy();
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }
                User.findOne({email}).then((user) => {
                        expect(user).toBeTruthy();
                        expect(user.password).not.toBe(password);
                        done();
                    })
                    .catch((e) => {
                        done(e);
                    });
            });
    }); // Should add new user record

});

describe('GET /users/me', () => {
    it('should get me the user when authenticated with x-auth header token', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should not return any data when authenitcation fails', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', 'invalidToken')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({})
            })
            .end(done);
    });
});

describe("POST /users/login", () => {
    it('should login when valid user email and password is sent', (done) => {
        request(app)
            .post('/users/login')
            .send({email: users[0].email, password: users[0].password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body.email).toBe(users[0].email);
                expect(res.body._id).toBeTruthy();
            })
            .end(done);
    });

    it('should fail if email does not exists', (done) => {
        request(app)
            .post('/users/login')
            .send({email:'invalid@email.com', password:'junk'})
            .expect(400)
            .end(done);
    });

    it('should fail if invalid credentials is sent', (done) => {
        request(app)
            .post('/users/login')
            .send({email:users[0].email, password:'junk'})
            .expect(400)
            .end(done);
    });
});

describe('DELETE /users/logout', () => {
    it('should delete the existing token sent from header x-auth', (done) => {
        var token = users[0].tokens[0].token;
        request(app)
            .delete('/users/logout')
            .set('x-auth', token)
            .expect(200)
            .end((err)=>{
                if(err) {
                    done(err);
                }
                User.findOne({_id:users[0]._id}).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should send 401 if token is not sent in header x-auth', (done) => {
        request(app)
            .delete('/users/logout')
            .expect(401)
            .end(done);
    });
})