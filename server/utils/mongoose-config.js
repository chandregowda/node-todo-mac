var mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/Todo").then(()=>{
    console.log("Successfully connected to mongodb");
}, (err) => {
    console.log("Failed to connect to MongoDB");
    process.exit(1);
});

module.exports = {mongoose};