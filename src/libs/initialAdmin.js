const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'user.model'));
const Role = require(path.join(__dirname, '..', 'models', 'role.model'));
require('dotenv').config();

const createInitialAdmin = async () => {
    try {
        const count = await User.estimatedDocumentCount();

        if(count === 0){
            const roles = await Role.find({name: {$in: ['user', 'admin']}}, {_id: true});
            
            if(roles.length > 0 ){
                userRoleId = roles[0]._id;
                adminRoleId = roles[1]._id;
            }else{
                console.log('Roles and membership are not created yet, waiting 5 seconds...');

                setTimeout(() => {
                   return createInitialAdmin();
                }, 5000);
            }

            const admin = new User({
                name: process.env.INITIAL_ADMIN_NAME,
                username: process.env.INITIAL_ADMIN_USERNAME,
                cellphone: process.env.INITIAL_ADMIN_CELLPHONE,
                email: process.env.INITIAL_ADMIN_EMAIL,
                password: await User.encryptPassword(process.env.INITIAL_ADMIN_PASSWORD),
                roles: [userRoleId._id.toString(), adminRoleId._id.toString()],
                userImage: "https://res.cloudinary.com/syphhy/image/upload/v1659924479/5b8626bc2bd5a65d22f2278f57e6ee75_s1bres.gif"
            });

            const adminSaved = await admin.save();

            console.log('Initial admin created.');
            console.log(adminSaved)
        }
    
    } catch (error) {
        console.error(error);
    }
};

module.exports = createInitialAdmin;