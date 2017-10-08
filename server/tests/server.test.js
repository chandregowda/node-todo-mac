const expect = require("expect");
const request = require("supertest");

const {
    app
} = require("./../server");
const {
    Todo
} = require("./../models/todo");

var todos = [{
    text: "First todo"
}, {
    text: "Second todo"
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
})