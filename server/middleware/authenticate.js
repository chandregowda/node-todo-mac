
const {User} = require("./../models/user");

var authenticate = (req, res, next) => {
    var token = req.header('x-auth');
    // console.log("Getting User for token: ", token);

    User.findByToken(token).then((user) => {
        if(!user) {
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        // console.log("Some error in authenticating:", e);
        res.status(401).send();
    });
}

module.exports = {authenticate};