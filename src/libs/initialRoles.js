const path = require('path');
const Role = require(path.join(__dirname, '..', 'models', 'role.model'));

const createInitialRoles = async () => {
    try {
        const count = await Role.estimatedDocumentCount();

        if(count == 0){
            const values = await Promise.all([
                new Role({
                    name: "user"
                }).save(),
            
                new Role({
                    name: "moderator"
                }).save(),
            
                new Role({
                    name: "admin"
                }).save()
            ]);
        
            console.log('Initial roles created.');
            console.log(values); 
        }
    
    } catch (error) {
        console.error(error);
    }
};

module.exports = createInitialRoles;