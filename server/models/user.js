var mongoose = require ("mongoose");
var validator = require("validator");
var jwt =  require("jsonwebtoken");
var _ = require("lodash");
var bcrypt = require("bcryptjs");

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
    // console.log("Finding user by token : ", token);
    var decoded;
    try {
        decoded = jwt.verify(token, 'secretKey');
    }catch (e) {
        // console.log("Some JWT error during decode", e);
        return Promise.reject();
    }
    return User.findOne({
        _id: decoded._id, 
        "tokens.token" : token,
        "tokens.access":'auth'
    });
}

UserSchema.statics.login = function(body) {
    var User = this;
    // console.log("Checking login for user: ", body.email, " / ", body.password);

    return User.findOne({email:body.email}).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        // console.log("User found", user);
        return new Promise((resolve, reject) => {
            bcrypt.compare(body.password, user.password, (err, result) => {
                if (result) {
                    // console.log("User is authenticated");
                    resolve(user);
                }else {
                    // console.log("Invalid user credentials");
                    reject();
                }
            });
        }).catch((e) => {
            return Promise.reject();
        });
    });
}

UserSchema.pre('save', function (next) {
    var user = this;
    if(user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        })
    } else {
        next();
    }
});

var User = mongoose.model("User", UserSchema);

module.exports = {User};