const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();
const User = require(path.join(__dirname, '..', 'models', 'user.model'));
const Role = require(path.join(__dirname, '..', 'models', 'role.model'));
const deleteImage = require(path.join(__dirname, '..', 'libs', 'dirLibrary'))

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];

        if(!token) return res.status(403).json({token: false, message: "No token provided"});

        const decoded = jwt.verify(token, process.env.SECRET_JWT_USER);
        console.log(decoded);
        req.userId = decoded.id;

        const user = await User.findById(req.userId, {password: 0});
        if(!user) return res.status(404).json({token: false,message: "No se reconoce el usuario, por favor logeate."});

        next();
    } catch (error) {
        return res.status(401).json({message: "Sin autorización."})
    }
}

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.headers.userid);
        const roles = await Role.find({_id: {$in: user.roles}});

        for (let i = 0; i < roles.length; i++) {
            if(roles[i].name ==="admin"){
                next();
                return;
            }
        }

        return res.status(403).json({message: "Se requiere rol de administrador"})
    } catch (error) {
        if(req.files[0]){
            const {filename} = req.files[0];
            const dirname = path.join(__dirname, '..', 'public', 'images', filename);
            deleteImage(dirname);
        }
        return res.status(500).send(error);
    }
}

module.exports = {verifyToken, isAdmin};