const mongoose = require('mongoose');

var Todo = mongoose.model("Todo", {
    text:{
        type:String,
        required:true,
        trim:true
    },
    completed : {
        type:Boolean,
        default:false
    },
    completedAt : {
        type: Number,
        default: 0
    }
});


// var todo = new Todo({
//     name:'hello'
// });

// todo.save().then((doc) => {
//     console.log("Newly saved data:");
//     console.log(JSON.stringify(doc, undefined, 2));
// }, (err) => {
//     console.log("Failed to save data");
// });

module.exports = {Todo};