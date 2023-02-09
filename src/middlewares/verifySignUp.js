const path = require('path');

const User = require(path.join(__dirname, '..', 'models', 'user.model'));
const {deleteReqImages} = require(path.join(__dirname, '..', 'libs', 'dirLibrary'));

const verifySignUp = {};

verifySignUp.checkDuplicate = (check, message) => {
    return async (req, res, next) => {
        const isDuplicate = await User.findOne({
            [check]: req.body[check]
        });
    
        if(isDuplicate) {
            deleteReqImages(req)

            return res.status(400).json({
                message,
                duplicate: check
            })
        };
    
        next();
    };
};

verifySignUp.validatePassword = async (req, res, next) => {
    const { password, validatePassword } = req.body;
    console.log(password, validatePassword)

    if(password !== validatePassword) {
        deleteReqImages(req)
        return res.status(400).json({
            message: 'Las contraseñas no coinciden.'
        })
    };

    next();
}

module.exports = verifySignUp;