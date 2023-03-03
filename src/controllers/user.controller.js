const path = require('path');
require('dotenv').config();
const User = require(path.join(__dirname, '..', 'models', 'user.model'));
const Shop = require(path.join(__dirname, '..', 'models', 'shop.model'));
const Role = require(path.join(__dirname, '..', 'models', 'role.model'));
const {deleteImage, deleteReqImages} = require(path.join(__dirname, '..', 'libs', 'dirLibrary'));

const userController = {};

userController.getUserById = async (req, res) => {
    try {
        const {id} = req.params;
        const userFinded = await User.findById(id, {
            password: false,
            roles: false
        });
        
        // await User.updateMany({}, {notifications: [], history: []});
        // await Shop.updateMany({}, {notifications: [], history: []});

        if(!userFinded) return res.status(404).send('No se ha podido encontrar el usuario.');

        res.status(200).send(userFinded);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

userController.updateUser = async (req, res) => {
    try {
        const {id} = req.params;
        const body = req.body;
        const userFinded = await User.findById(id);

        if(!userFinded) return res.status(404).send('No se ha podido encontrar el usuario.');

        if(req.files && req.files.profileImage){
            const oldImageName = userFinded.userImage.split('/images/')[1] || userFinded.userImage.split('/image/upload/')[1];
            console.log(oldImageName)
            const routeImagesFolder = path.join(__dirname, '..', 'public', 'images', oldImageName);
            deleteImage(routeImagesFolder);

            const {filename} = req.files.profileImage[0];
            body.userImage = `${process.env.ROOT_URL}/images/${filename}`;
        }

        const userUpdated = await User.findByIdAndUpdate(id, body, {new: true}).deepPopulate([ 'shop.products' ,'shoppingHistory']);

        const rolesExist = await Role.find({_id: {$in: userUpdated.roles}}, {name: true});

        const userRoles = rolesExist.map(el => el.name);

        res.status(200).send({
            ...userUpdated._doc,
            password: undefined,
            roles: userRoles
        });
    } catch (error) {
        deleteReqImages(req)
        console.log(error);
        res.status(500).send({
            message: 'Ha ocurrido un error indefinido al actualizar el usuario.'
        });
    }
}

userController.updateWishList = async (req, res) => {
    try {
        const {id} = req.params;
        const {productId} = req.body;

        const user = await User.findById(id, {wishList: true});
        console.log(user.wishList.includes(productId));

        if(!user.wishList.includes(productId)) {
            const userWishList = await User.findByIdAndUpdate(id, { '$addToSet': { 'wishList': productId } }, {new: true});
            res.status(200).send(userWishList.wishList);
        }

        if(user.wishList.includes(productId)) {
            const userWishList = await User.findByIdAndUpdate(id, { '$pull': { 'wishList': productId } }, {new: true});
            res.status(200).send(userWishList.wishList);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

userController.updateFollows = async (req, res) => {
    try {
        const {id} = req.params;
        const {shopId} = req.body;

        const user = await User.findById(id, {follows: true});
        console.log(user.follows.includes(shopId));

        if(!user.follows.includes(shopId)) {
            const userFollows = await User.findByIdAndUpdate(id, { '$addToSet': { 'follows': shopId } }, {new: true});
            res.status(200).send(userFollows.follows);
        }

        if(user.follows.includes(shopId)) {
            const userFollows = await User.findByIdAndUpdate(id, { '$pull': { 'follows': shopId } }, {new: true});
            res.status(200).send(userFollows.follows);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

userController.updateShoppingCart = async (req, res) => {
    try{
        const {id} = req.params;
        const {productId} = req.body;

        const user = await User.findById(id, {shoppingCart: true});

        if(!user.shoppingCart.includes(productId)) {
            const userUpdated = await User.findByIdAndUpdate(id, { '$addToSet': { 'shoppingCart': productId } }, {new: true});
            res.status(200).send(userUpdated.shoppingCart);
        }

        if(user.shoppingCart.includes(productId)) {
            const userUpdated = await User.findByIdAndUpdate(id, { '$pull': { 'shoppingCart': productId } }, {new: true});
            res.status(200).send(userUpdated.shoppingCart);
        }
    } catch(e) {
        console.log(e);
    }
}

userController.getFollows = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id, {follows: true}).deepPopulate(['follows']);
        res.status(200).send(user.follows);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

userController.getWishList = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id, {wishList: true}).populate('wishList');
        console.log(user.wishList);
        res.status(200).send(user.wishList);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};

userController.getShoppingCart = async (req, res) => {
    try{
        const {id} = req.params;

        if(id !== undefined) {
            const user = await User.findById(id, {shoppingCart: true}).populate(["shoppingCart"]);

            let aux = {};
            let count = 0;
            const arrayToSend = [];

            for (const product of user.shoppingCart) {
                const shopOfProduct = await Shop.findById(product.shop, {name: true, profileImage: true});
                
                if(!aux[shopOfProduct.name]) {
                    aux[shopOfProduct.name] = {
                        shopImage: shopOfProduct.profileImage,
                        name: shopOfProduct.name,
                        products: [],
                        position: count
                    }

                    count = count + 1;
                }

                aux[shopOfProduct.name].products.push(product);
                arrayToSend[aux[shopOfProduct.name].position] = aux[shopOfProduct.name];
            }

            res.status(200).send(arrayToSend);
        }
    } catch(e) {
        console.log(e);
    }
};

userController.getNotifications = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id, {notifications: true});
        return res.status(200).send(user.notifications)
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
}


module.exports = userController;