var mongoose = require("mongoose");

mongoose.Promise = global.Promise;

var mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/Todo";
mongoose.connect(mongoURI).then(()=>{
    console.log("Successfully connected to mongodb");
}, (err) => {
    console.log("Failed to connect to MongoDB");
    process.exit(1);
});

module.exports = {mongoose};