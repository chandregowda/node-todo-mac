var mongoose = require ("mongoose");
var validator = require("validator");
var jwt =  require("jsonwebtoken");
var _ = require("lodash");

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique:true,
        validate: validator.isEmail
    },
    password: {
        type: String,
        require: true,
        minlength: 6,
        trim: true
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['email', '_id']);
}
UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, "secretKey").toString() ;

    user.tokens.push({access, token});
    return user.save().then((doc) => {
        return token;
    });
}

UserSchema.statics.findByToken = function(token) {
    var User = this;
    var decoded;
    try {
        decoded = jwt.verify(token, 'secretKey');
    }catch (e) {
        console.log("Some JWT error during decode", e);
        return new Promise((resolve, reject)=>{
            resolve({});
        });
    }
    return User.findOne({
        "_id": decoded._id, "tokens.token" : token, "tokens.access":'auth'
    });
}

var User = mongoose.model("User", UserSchema);

module.exports = {User};