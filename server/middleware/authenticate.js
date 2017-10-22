
const {User} = "../models/user";

var authenticate = (req, res, next) => {
    console.log("Getting User for token", req.header('x-auth'));
    var token = req.header('x-auth');

    User.findByToken(token).then((user) => {
        if(!user) {
            return Promise.reject();
        }
        req.user = user;
        next();
    }).catch((e) => {
        res.status(401).send();
    });

}

module.exports = {authenticate};