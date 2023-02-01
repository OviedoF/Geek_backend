const path = require('path');

const User = require(path.join(__dirname, '..', 'models', 'user.model'));
const deleteImage = require(path.join(__dirname, '..', 'libs', 'dirLibrary'));

const verifySignUp = {};

verifySignUp.checkDuplicate = (check, message) => {
    return async (req, res, next) => {
        const isDuplicate = await User.findOne({
            [check]: req.body[check]
        });
    
        if(isDuplicate) {
            if(req.files[0]){
                const { filename } = req.files[0];
                const pathImage = path.join(__dirname, '..', 'public', 'images', filename);

                deleteImage(pathImage);
            }

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

    if(password !== validatePassword) {
        const { filename } = req.files[0];
        const pathImage = path.join(__dirname, '..', 'public', 'images', filename);

        deleteImage(pathImage);

        return res.status(400).json({
            message: 'Las contraseñas no coinciden.'
        })
    };

    next();
}

module.exports = verifySignUp;