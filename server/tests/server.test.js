const expect = require("expect");
const request = require("supertest");
const {ObjectID} = require("mongodb");

const {
    app
} = require("./../server");
const {
    Todo
} = require("./../models/todo");

var todos = [{
    text: "First todo",
    _id: new ObjectID()
}, {
    text: "Second todo",
    _id: new ObjectID()
}];

beforeEach((done) => {
    Todo.remove({})
        .then(() => {
            return Todo.insertMany(todos)
        })
        .then(() => done());
});

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

                Todo.find({text}).then((todos) => {
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
            .end( (err, res) => {
                if(err) {
                    return done(err);
                }
                Todo.find().then( (todos) => {
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
            .end( (err, res) => {
                if(err) {
                    return done(err);
                }

                Todo.find().then( (todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    }); // should get one record

    it ('should get one record from todo list', (done) => {
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
    });// 404 for invalid ID
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