const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require(path.join(__dirname, '..', 'models', 'user.model'));
const Role = require(path.join(__dirname, '..', 'models', 'role.model'));
const {deleteReqImages} = require(path.join(__dirname, '..', 'libs', 'dirLibrary'))

const authController = {};

authController.signUp = async (req, res) => {
    try {
        const { filename } = req.files.profileImage[0];
        const { password } = req.body;
        const userRole = await Role.findOne( { name: "user" } );

        const newUser = new User({
            ...req.body,
            userImage: `${process.env.ROOT_URL}/images/${filename}`,
            password: await User.encryptPassword(password),
            roles: [ userRole._id ],
            wallet: {
                balance: 0,
                transactions: []
            }
        });

        const savedUser = await newUser.save();

        const token = jwt.sign({id: savedUser._id}, 'FKDOCKODfkpodKCDfkD0F9Dkc90d', {
            expiresIn: 86400
        });

        res.status(201).send({
            token,
            message: 'Usuario registrado correctamente!',
            userData: {
                name: req.body.name,
                username: req.body.username
            }
        });
        
    } catch (error) {
        deleteReqImages(req)
        console.log(error)
        res.status(500).send({
            message: 'Error al registrar el usuario, intente de nuevo.',
        });
    }
};

authController.signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userFound = await User.findOne({
            email: email
        }).populate("roles");

        if(!userFound) return res.status(404).json({
            message: "Email no encontrado, intente de vuelta."
        });

        const matchPassword = await User.comparePassword(password, userFound.password);

        if(!matchPassword) return res.status(404).json({
            token: null,
            message: "Contraseña incorrecta, verifique por favor."
        });

        const token = jwt.sign({id: userFound._id}, 'FKDOCKODfkpodKCDfkD0F9Dkc90d', {
            expiresIn: 86400
        });
        
        res.status(200).json({token});
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

authController.identifyUserJSW = async (req, res) => {
    try {
        const token = req.body.token;

        const decoded = jwt.verify(token, 'FKDOCKODfkpodKCDfkD0F9Dkc90d');

        if(!decoded) return res.status(404).send('Sesión terminada, por favor ingresa de nuevo.');

        const user = await User.findById(decoded.id, {
            password: false
        }).deepPopulate([ 'shop.products' ,'shoppingHistory']);

        const rolesExist = await Role.find({_id: {$in: user.roles}}, {name: true});

        const userRoles = rolesExist.map(el => el.name);

        const userToSend = {
            ...user._doc,
            roles: userRoles
        }

        res.status(200).send(userToSend);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Error al identificar el usuario, intente de nuevo.'
        });
    }
}

module.exports = authController;